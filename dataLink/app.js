import express from "express";

import userRoutes from "./routes/user.routes.js";

import connectDB from "./config/db.js";

const app = express();

app.use(express.json());

connectDB();

app.use("/user", userRoutes);

export default app;
