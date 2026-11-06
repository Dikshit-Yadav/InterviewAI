import logger from "../utils/logger.js";

const errorHandler = (err, req, res, _next) => {
  const statusCode =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  if (statusCode >= 500) {
    logger.error(
      {
        err: {
          type: err.name,
          message: err.message,
          stack: err.stack,
        },
        method: req.method,
        path: req.originalUrl || req.path,
      },
      "Unhandled request error"
    );
  } else {
    logger.warn(
      {
        statusCode,
        message: err.message,
        method: req.method,
        path: req.originalUrl || req.path,
      },
      "Client request error"
    );
  }

  res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : err.message,
    ...(statusCode === 404 ? { error: "Not Found" } : {}),
  });
};

export default errorHandler;
