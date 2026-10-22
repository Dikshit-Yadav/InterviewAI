# InterviewAI

InterviewAI is an AI-assisted interview preparation application. Users can
practice role-specific interviews, review their resumes, generate questions
from resume content, and build a downloadable resume.

## Features

- Email registration with Mailjet verification codes, Google sign-in, and
  password reset.
- Authenticated dashboard with interview history, progress, and reports.
- Configurable mock interviews by role, experience level, and interview type.
- AI-generated interview questions, answer-dependent follow-ups, and feedback
  reports.
- Resume review with ATS-oriented recommendations and practice questions.
- Resume-based interview questions, including questions about listed projects.
- Resume builder with repeatable experience, project, and education entries,
  a preview, and browser-based PDF download.
- Light and dark themes.
- Interview answer entry by keyboard or speech recognition. The active session
  disables common copy, cut, and paste actions in the browser.

> Copy/paste restrictions are client-side browser behavior and are not a
> security boundary.

## Technology

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, React Router, Axios, Zod
- **Backend:** Node.js, Express, MongoDB with Mongoose, Pino
- **AI:** Groq API
- **Email:** Mailjet API
- **Authentication:** JWT cookies and Google OAuth
- **Logging:** Pino pretty console output and date-rotated JSON log files

## Project layout

```text
InterviewAI/
├── backend/       Express API and MongoDB services
├── frontend/      React application
├── docker-compose.yml
└── README.md
```

Install and run the frontend and backend separately. Use two terminals from the
repository root.

## Requirements

- Node.js compatible with the installed Vite and TypeScript versions.
- npm.
- A MongoDB connection string.
- A Groq API key for AI interview and resume features.
- Mailjet API credentials and a verified sender for email verification and
  password reset.
- Google OAuth credentials if Google sign-in is required.

## Local setup

### 1. Configure the backend

Create `backend/.env` and set the following values:

```dotenv
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
MONGO_URI=<your-mongodb-connection-string>
JWT_SECRET=<a-long-random-secret>

GROQ_API_KEY=<your-groq-api-key>
# Optional model overrides:
# GROQ_INTERVIEW_MODEL=openai/gpt-oss-20b
# GROQ_RESUME_MODEL=openai/gpt-oss-20b
# GROQ_EVAL_MODEL=openai/gpt-oss-20b
# GROQ_REPORT_MODEL=openai/gpt-oss-120b

MAILJET_API_KEY=<your-mailjet-api-key>
MAILJET_API_SECRET=<your-mailjet-api-secret>
MAILJET_FROM_EMAIL=<verified-sender-email>
MAILJET_FROM_NAME=InterviewAI

# Required only for Google sign-in:
GOOGLE_CLIENT_ID=<your-google-oauth-client-id>
GOOGLE_CLIENT_SECRET=<your-google-oauth-client-secret>
GOOGLE_CALLBACK_URL=<your-backend-google-callback-url>

# Optional logging level, for example: debug, info, warn, or error
LOG_LEVEL=debug
```

The same keys are listed in `backend/.env.example`; copy it to `backend/.env`
and replace the placeholders. The example MongoDB URI is for Docker Compose. For
local development outside Docker, use a MongoDB URI reachable from your host,
such as `mongodb://127.0.0.1:27017/interviewai`.

Configure the Google OAuth client to allow the callback URL used in
`GOOGLE_CALLBACK_URL`. Keep backend credentials private and never commit `.env`
files.

Install backend dependencies and start the API:

```bash
cd backend
npm install
npm run dev
```

The API listens on port `5000` by default (or the configured `PORT`). Its root
endpoint is `GET /`.

### 2. Configure the frontend

Create `frontend/.env`:

```dotenv
VITE_API_URL=http://localhost:5000
```

For local development, `frontend/.env.example` contains this API URL.

Install frontend dependencies and start Vite:

```bash
cd frontend
npm install
npm run dev
```

Vite prints the local URL when it starts, typically
`http://localhost:5173`. The frontend origin must match the backend's
`CLIENT_URL` setting so credentialed API requests are allowed.

If `VITE_API_URL` is unset, development uses `http://localhost:5000` and a
production build uses the same-origin `/api` path. The Docker/Nginx setup uses
`/api` and proxies it to the backend automatically.

## Run with Docker

Docker Compose runs MongoDB, the Node.js API, and a production-built frontend
served by Nginx. MongoDB data is persisted in a named Docker volume. Nginx
serves the React application, supports client-side routes, and proxies requests
from `/api/` to the backend service. MongoDB and the backend are available only
on the internal Compose network.

1. Configure `backend/.env` using `backend/.env.example` as a template. Set
   `CLIENT_URL` to the origin where the browser will open the app, for example
   `http://localhost:8080`. Compose uses its included MongoDB container by
   default; to use a managed MongoDB database instead, set the `MONGO_URI`
   environment variable before starting Compose. That URI must be reachable
   from inside the backend container.
2. For Google sign-in, set `GOOGLE_CALLBACK_URL` to
   `http://localhost:8080/auth/google/callback` and add that exact URL to the
   OAuth client's authorized redirect URIs. Nginx proxies this callback path
   directly to the backend.
3. From the repository root, build and start the containers:

   ```bash
   docker compose up --build
   ```

4. Open `http://localhost:8080`. To use another host port, set
   `FRONTEND_PORT` before starting Compose, and update `CLIENT_URL` and the
   Google OAuth callback URL to match.

Stop the containers with `Ctrl+C`, or stop and remove them with:

```bash
docker compose down
```

The frontend image receives `VITE_API_URL=/api` at build time. The default
Compose command serves HTTP for local use. To remove the MongoDB data volume as
well as stop the stack, run `docker compose down --volumes`.

### Deploy on an EC2 instance

The root-level `deploy-ec2.sh` script installs Docker if needed, validates the
backend configuration, builds the images, starts the Compose stack, and waits
for the HTTPS website to respond. The HTTPS profile uses Caddy to obtain and
renew TLS certificates automatically.

1. Launch an Amazon Linux 2023 or Ubuntu EC2 instance. Configure its security
   group to allow inbound TCP `22` from your trusted IP and TCP `80` and `443`
   from the intended website audience. Do not expose backend port `5000` or
   MongoDB port `27017`.
2. Point a domain's DNS A record to the instance's public IP. Keep the instance
   public IP stable (for example, assign an Elastic IP).
3. Copy or clone this project onto the instance. Create `backend/.env` from
   `backend/.env.example`; set `CLIENT_URL=https://your-domain.example`,
   configure the required AI/email secrets, and set Google OAuth credentials
   if using Google sign-in. For Google OAuth, also set
   `GOOGLE_CALLBACK_URL=https://your-domain.example/auth/google/callback`
   and register that exact callback URL with Google.
4. Run the deploy script from the project root:

   ```bash
   chmod +x deploy-ec2.sh
   APP_DOMAIN=your-domain.example ./deploy-ec2.sh
   ```

   If the EC2 user cannot access Docker directly, run the script with `sudo`
   while keeping `APP_DOMAIN` in the environment:

   ```bash
   sudo APP_DOMAIN=your-domain.example ./deploy-ec2.sh
   ```

The script binds the frontend's internal HTTP port to localhost; public traffic
is served over HTTPS by Caddy. Compose persists MongoDB data and Caddy
certificates in named Docker volumes. To inspect a deployment, run
`docker compose --profile https ps` and
`docker compose --profile https logs --tail=100`. To stop the services, run
`docker compose --profile https down` from the project root. Do not use
`--volumes` unless you intentionally want to delete the database and stored
certificates.

## Available scripts

Run these commands from the corresponding `frontend/` or `backend/` directory.

### Backend logs

The backend prints one readable request log line containing the level, time,
process ID, hostname, service, environment, request ID/method/URL/query,
remote address, user agent, response status, response time, and message.
Sensitive query keys such as OAuth codes/state, tokens, passwords, OTPs, and
email values are redacted.

Structured JSON logs are also written to `backend/logs/` in separate daily
files named with the date, for example `interviewai.2026-10-22.1.log`. Up to 30
rotated daily files plus the current active file are retained. In Docker
Compose, the `backend_logs` named volume persists these files across container
recreation; on EC2 they remain in that volume. Use `docker compose exec backend
ls -l /app/logs` to list files and
`docker compose exec backend sh -c 'tail -n 100 /app/logs/<log-file>'` to read
one. `LOG_LEVEL` controls which levels are written to console and file.

| Package | Command | Description |
| --- | --- | --- |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run build` | Type-check and create a production build |
| Frontend | `npm run preview` | Serve the built frontend locally |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm test` | Run frontend Vitest tests |
| Backend | `npm run dev` | Start the API with nodemon |
| Backend | `npm start` | Start the API with Node.js |

## API overview

All endpoints are served by the backend. Protected endpoints require the
authenticated cookie.

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/auth/register/send-code` | Send a registration verification code |
| `POST` | `/auth/register/verify-code` | Verify a registration code |
| `POST` | `/auth/register` | Register a verified email address |
| `POST` | `/auth/login` | Sign in with email and password |
| `GET` | `/auth/google` | Begin Google sign-in |
| `GET` | `/auth/google/callback` | Handle the Google OAuth callback |
| `GET` | `/auth/me` | Return the current authenticated user |
| `POST` | `/auth/logout` | Sign out |
| `POST` | `/auth/password/forgot` | Send a password reset code |
| `POST` | `/auth/password/reset` | Set a new password using the code |
| `GET` | `/dashboard` | Load dashboard data |
| `GET` | `/history` | Load interview history |
| `PUT` | `/profile/update` | Update the current user's profile |
| `POST` | `/interview/start` | Start a configured mock interview |
| `POST` | `/interview/start-from-resume` | Start an interview based on an uploaded resume |
| `POST` | `/interview/review-resume` | Review an uploaded resume |
| `GET` | `/interview/questions/:id` | Get questions for an interview |
| `POST` | `/interview/follow-up/:id` | Request an answer-dependent follow-up |
| `POST` | `/interview/submit/:id` | Submit interview answers |
| `POST` | `/interview/generate-report/:id` | Generate interview feedback |

Resume upload endpoints accept one PDF or DOCX file up to 5 MB.

## Privacy and security notes

- Do not commit secrets, OAuth credentials, API keys, or `.env` files.
- Resume files are processed in memory by the backend and are not saved by the
  resume upload flow. Resume content is sent to the configured AI provider for
  review or question generation.
- The resume builder keeps entered details in frontend state for preview and
  PDF printing; it does not upload them to the backend.
- Browser copy/paste restrictions can be bypassed and should not be relied on
  to protect interview content.

## Troubleshooting

- **API requests fail or CORS errors appear:** verify the frontend's
  `VITE_API_URL` and that backend `CLIENT_URL` exactly matches the frontend
  origin.
- **MongoDB connection fails:** check `MONGO_URI`, network access, and database
  availability.
- **AI features fail:** verify `GROQ_API_KEY` and check backend logs for provider
  or model errors. Optional model variables can select supported Groq models.
- **Verification or password reset email fails:** verify the Mailjet API
  credentials and ensure `MAILJET_FROM_EMAIL` is an approved sender.
- **Google sign-in fails:** verify the client ID, secret, callback URL, and
  authorized redirect URI in the Google OAuth configuration.
