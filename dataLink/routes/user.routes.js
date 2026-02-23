import express from "express";
import { signupUser, login } from "../controllers/user.controller.js";

const router = express.Router();

router.post("/signup", signupUser);

router.post("/login", login);

export default router;
