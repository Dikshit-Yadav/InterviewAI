import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import ejs from "ejs";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import interviewRoutes from "./routes/interviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import profileRoutes from "./routes/profileRoutes.js";
import requestLogger from "./middlewares/requestLogger.js";
import errorHandler from "./middlewares/errorHandler.js";


const app = express();
const isProduction = process.env.NODE_ENV === "production";

app.use(requestLogger);
app.set("view engine", "ejs");
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/auth", authRoutes);
app.use("/interview", interviewRoutes);
app.use("/", dashboardRoutes);
app.use("/profile", profileRoutes);


app.get("/", (req, res) => {
  res.send("api running");
});

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});
app.use(errorHandler);

export default app;