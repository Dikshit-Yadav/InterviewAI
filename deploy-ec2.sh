#!/usr/bin/env bash

set -Eeuo pipefail

ROOT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_ENV="${ROOT_DIR}/backend/.env"

log() {
  printf '[deploy] %s\n' "$*"
}

fail() {
  printf '[deploy] ERROR: %s\n' "$*" >&2
  exit 1
}

if [[ -z "${APP_DOMAIN:-}" ]]; then
  fail "Set APP_DOMAIN to the DNS name pointed at this EC2 instance, for example: APP_DOMAIN=interview.example.com ./deploy-ec2.sh"
fi

if [[ ! "${APP_DOMAIN}" =~ ^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$ ]]; then
  fail "APP_DOMAIN must be a valid public DNS name (not an IP address or localhost)."
fi

[[ -f "${BACKEND_ENV}" ]] || fail "Missing backend/.env. Copy backend/.env.example to backend/.env and configure it first."

read_env_value() {
  local key="$1"
  local value

  value="$(sed -n "s/^${key}=//p" "${BACKEND_ENV}" | tail -n 1 | tr -d '\r')"
  value="${value%\"}"
  value="${value#\"}"
  value="${value%\'}"
  value="${value#\'}"
  printf '%s' "${value}"
}

require_env_value() {
  local key="$1"
  local value

  value="$(read_env_value "${key}")"
  [[ -n "${value}" && ! "${value}" =~ ^\<[^[:space:]]+\>$ ]] ||
    fail "Set ${key} to a real value in backend/.env before deploying."
}

require_env_value JWT_SECRET
require_env_value GROQ_API_KEY
require_env_value MAILJET_API_KEY
require_env_value MAILJET_API_SECRET
require_env_value MAILJET_FROM_EMAIL

CLIENT_URL="$(read_env_value CLIENT_URL)"
[[ "${CLIENT_URL}" == "https://${APP_DOMAIN}" ]] ||
  fail "Set CLIENT_URL=https://${APP_DOMAIN} in backend/.env so browser authentication works."

MONGO_URI="$(read_env_value MONGO_URI)"
if [[ -n "${MONGO_URI}" ]]; then
  export MONGO_URI
fi

command -v curl >/dev/null 2>&1 || fail "curl is required. Install curl and run this script again."

if ! command -v docker >/dev/null 2>&1; then
  if [[ "$(id -u)" -ne 0 ]] && ! command -v sudo >/dev/null 2>&1; then
    fail "Docker is missing and sudo is unavailable. Install Docker Engine and Compose plugin first."
  fi
  log "Installing Docker Engine and the Compose plugin using Docker's official installer..."
  installer="$(mktemp)"
  trap 'rm -f "${installer:-}"' EXIT
  curl -fsSL https://get.docker.com -o "${installer}"
  if [[ "$(id -u)" -eq 0 ]]; then
    sh "${installer}"
  else
    sudo sh "${installer}"
  fi
  rm -f "${installer}"
  trap - EXIT
fi

if command -v systemctl >/dev/null 2>&1; then
  if [[ "$(id -u)" -eq 0 ]]; then
    systemctl enable --now docker
  elif command -v sudo >/dev/null 2>&1; then
    sudo systemctl enable --now docker
  fi
fi

if docker info >/dev/null 2>&1; then
  DOCKER=(docker)
elif command -v sudo >/dev/null 2>&1 && sudo docker info >/dev/null 2>&1; then
  DOCKER=(sudo docker)
else
  fail "Docker is installed but unavailable to this user. Run with sudo or grant this user Docker access."
fi

"${DOCKER[@]}" compose version >/dev/null 2>&1 ||
  fail "Docker Compose plugin is required. Install Docker Compose v2, then rerun this script."

if ! getent hosts "${APP_DOMAIN}" >/dev/null 2>&1; then
  fail "APP_DOMAIN does not resolve yet. Point its DNS A record to this EC2 instance, wait for DNS propagation, then retry."
fi

chmod 600 "${BACKEND_ENV}"

export APP_DOMAIN
export FRONTEND_PORT=8080
export FRONTEND_BIND_ADDRESS=127.0.0.1

cd "${ROOT_DIR}"
log "Validating Compose configuration..."
"${DOCKER[@]}" compose --profile https config --quiet

log "Building and starting the application..."
"${DOCKER[@]}" compose --profile https up -d --build --remove-orphans

log "Waiting for https://${APP_DOMAIN} to respond..."
for attempt in {1..60}; do
  if curl --fail --silent --output /dev/null "https://${APP_DOMAIN}/"; then
    log "Deployment is ready: https://${APP_DOMAIN}"
    exit 0
  fi
  sleep 5
done

printf '\n[deploy] The site did not become available within 5 minutes.\n' >&2
printf '[deploy] Check EC2 security-group inbound rules for TCP 80 and 443, DNS, and container logs:\n' >&2
"${DOCKER[@]}" compose --profile https ps >&2
"${DOCKER[@]}" compose --profile https logs --tail=80 caddy frontend backend >&2
exit 1
