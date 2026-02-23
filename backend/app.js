import express from "express";
import cookieParser from "cookie-parser";
import authRoutes from "./authentication/auth.routes.js";

const app = express();

app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRoutes);

export default app;
