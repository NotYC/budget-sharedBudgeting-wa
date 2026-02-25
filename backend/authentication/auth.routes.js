import express from "express";
import {signup} from "./auth.controller.js";
import {login} from "./auth.controller.js";
import {logout} from "./auth.controller.js";
import {authMiddleware} from "../middleware/auth.middleware.js";

const router = express.Router();

// Public hits
router.post("/signup", signup);
router.post("/login" ,login);


// Protected hits
router.use(authMiddleware)
router.post("/logout", logout);

export default router;
