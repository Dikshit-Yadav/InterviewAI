import pinoHttp from "pino-http";
import logger from "../utils/logger.js";

const sensitiveQueryKey = /code|state|token|password|secret|key|otp|email/i;

const sanitizeQueryValue = (value) => {
  if (Array.isArray(value)) return value.map(sanitizeQueryValue);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [
        key,
        sensitiveQueryKey.test(key)
          ? "[REDACTED]"
          : sanitizeQueryValue(nestedValue),
      ])
    );
  }
  return value;
};

const sanitizeQuery = (query = {}) =>
  Object.fromEntries(
    Object.entries(query).map(([key, value]) => [
      key,
      sensitiveQueryKey.test(key) ? "[REDACTED]" : sanitizeQueryValue(value),
    ])
  );

const requestLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => {
      const [url] = (req.url || "").split("?");
      return {
        id: req.id,
        method: req.method,
        url,
        query: sanitizeQuery(req.query),
        remoteAddress: req.socket?.remoteAddress,
        userAgent: req.headers["user-agent"],
      };
    },
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: () => "HTTP request completed",
  customErrorMessage: (_req, _res, err) =>
    `HTTP request failed: ${err?.message || "server error"}`,
});

export default requestLogger;
