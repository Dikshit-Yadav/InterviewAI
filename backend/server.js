import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import connectDB from "./config/db.js";
import logger from "./utils/logger.js";


const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      logger.info({ port: PORT }, "HTTP server listening");
    });
  } catch (err) {
    logger.fatal({ err }, "Server startup failed");
    process.exit(1);
  }
};

process.on("unhandledRejection", (reason) => {
  logger.fatal({ err: reason }, "Unhandled promise rejection");
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  logger.fatal({ err }, "Uncaught exception");
  process.exit(1);
});

startServer();