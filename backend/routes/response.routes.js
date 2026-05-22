import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import {
  submitResponse,
  getResponses,
  getRespondentResponse,
  updateRespondentResponse,
  deleteRespondentResponse,
} from "../controllers/index.js";

const router = express.Router();

router.post("/:id", submitResponse); // Public submit
router.get("/:id", verifyToken, getResponses); // Only owner can view responses

// Respondent CRUD routes (Public)
router.get("/:id/respondent", getRespondentResponse);
router.put("/:id/respondent", updateRespondentResponse);
router.delete("/:id/respondent", deleteRespondentResponse);

export default router;

