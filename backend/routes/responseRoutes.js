import express from "express";
import Form from "../models/Form.js";
import Response from "../models/Response.js";
import { verifyToken } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Route 1: Submit a response to a form (public)
router.post("/:formId", async (req, res) => {
  try {
    const { formId } = req.params;
    const { respondentEmail, answers } = req.body;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if form expired
    if (form.expiresAt && new Date() > form.expiresAt) {
      return res.status(400).json({ message: "This form has expired." });
    }

    // Save response
    const newResponse = new Response({
      form: formId,
      respondentEmail,
      answers,
    });

    await newResponse.save();
    res.status(201).json({ message: "Response submitted successfully" });
  } catch (error) {
    console.error("Error submitting response:", error);
    res.status(500).json({ message: "Error submitting response", error });
  }
});

// ✅ Route 2: Get all responses (only for form creator)
router.get("/:formId/responses", verifyToken, async (req, res) => {
  try {
    const { formId } = req.params;

    // Check if form exists
    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    // Check if logged-in user is the form creator
    if (form.createdBy.toString() !== req.userId) {
      return res.status(403).json({ message: "Access denied. Not the form owner." });
    }

    // Get responses
    const responses = await Response.find({ form: formId });
    res.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    res.status(500).json({ message: "Error fetching responses", error });
  }
});

export default router;
