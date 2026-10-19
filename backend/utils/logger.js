import dotenv from "dotenv";
import pino from "pino";

dotenv.config();

const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug"),
  redact: {
    paths: [
      "req.headers.authorization",
      "req.headers.cookie",
      "password",
      "*.password",
      "token",
      "*.token",
      "client_secret",
      "*.client_secret",
    ],
    censor: "[REDACTED]",
  },
  base: {
    service: "interviewai-api",
    environment: process.env.NODE_ENV || "development",
  },
  timestamp: pino.stdTimeFunctions.isoTime,
});

export default logger;
