import logger from "../utils/logger.js";

const errorHandler = (err, req, res, _next) => {
  const statusCode =
    Number.isInteger(err.status) && err.status >= 400 && err.status < 600
      ? err.status
      : 500;

  logger.error(
    {
      err: {
        type: err.name,
        message: err.message,
        stack: err.stack,
      },
      method: req.method,
      path: req.path,
    },
    "Unhandled request error"
  );

  res.status(statusCode).json({
    message: statusCode >= 500 ? "Internal server error" : err.message,
  });
};

export default errorHandler;
