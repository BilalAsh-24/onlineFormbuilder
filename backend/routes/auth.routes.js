import express from "express";
import { register, login, getUserProfile } from "../controllers/index.js";
import { verifyToken } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getUserProfile);

export default router;
