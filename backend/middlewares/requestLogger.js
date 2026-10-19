import pinoHttp from "pino-http";
import logger from "../utils/logger.js";

const requestLogger = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url?.split("?")[0],
    }),
    res: (res) => ({
      statusCode: res.statusCode,
    }),
  },
  customLogLevel: (_req, res, err) => {
    if (err || res.statusCode >= 500) return "error";
    if (res.statusCode >= 400) return "warn";
    return "info";
  },
  customSuccessMessage: (req, res) =>
    `${req.method} ${req.url?.split("?")[0]} completed with ${res.statusCode}`,
  customErrorMessage: (req, res, err) =>
    `${req.method} ${req.url?.split("?")[0]} failed with ${res.statusCode}: ${err?.message || "server error"}`,
});

export default requestLogger;
