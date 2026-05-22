import express from "express";
import { verifyToken } from "../middleware/auth.middleware.js";
import { getMyForms, createForm, getFormById, updateForm, deleteForm } from "../controllers/form.controller.js";

const router = express.Router();

router.get("/myforms", verifyToken, getMyForms);
router.post("/create", verifyToken, createForm);
router.get("/:id", getFormById); // Public form view
router.put("/:id", verifyToken, updateForm); // Update form
router.delete("/:id", verifyToken, deleteForm); // Delete form

export default router;
