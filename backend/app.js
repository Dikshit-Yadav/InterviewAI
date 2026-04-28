import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import cookieParser from "cookie-parser";
import interviewRoutes from "./routes/interviewRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"

const app = express();
// console.log(process.env.CLIENT_URL);
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
app.use("/dashboard", dashboardRoutes);


app.get("/", (req, res) => {
  res.send("api running");
});

export default app;