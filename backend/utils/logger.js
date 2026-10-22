import dotenv from "dotenv";
import pino from "pino";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config({ path: resolve(dirname(fileURLToPath(import.meta.url)), "../.env") });
dotenv.config();

const logLevel =
  process.env.LOG_LEVEL || (process.env.NODE_ENV === "production" ? "info" : "debug");
const logFile = resolve(dirname(fileURLToPath(import.meta.url)), "../logs/interviewai.log");

const logger = pino({
  level: logLevel,
  transport: {
    targets: [
      {
        target: resolve(dirname(fileURLToPath(import.meta.url)), "prettyTransport.js"),
        level: logLevel,
        options: {
          colorize: Boolean(process.stdout.isTTY),
          singleLine: true,
          translateTime: "yyyy-mm-dd HH:MM:ss.l",
          ignore: "pid,hostname,service,environment,req,res,responseTime",
        },
      },
      {
        target: "pino-roll",
        level: logLevel,
        options: {
          file: logFile,
          frequency: "daily",
          dateFormat: "yyyy-MM-dd",
          mkdir: true,
          limit: { count: 30, removeOtherLogFiles: true },
        },
      },
    ],
  },
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
