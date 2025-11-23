// backend/routes/formRoutes.js
import express from "express";
import Form from "../models/Form.js";
import auth from "../middleware/auth.js";

const router = express.Router();

// CREATE FORM (Protected)
router.post("/create", auth, async (req, res) => {
  try {
    const { title, description, questions, expiresAt } = req.body;

    const form = await Form.create({
      title,
      description,
      questions,
      expiresAt: expiresAt || null,
      createdBy: req.user.id,
    });

    res.status(201).json(form);
  } catch (error) {
    res.status(500).json({ message: "Failed to create form" });
  }
});

// GET MY FORMS (Protected) — MUST COME BEFORE /:id
router.get("/myforms", auth, async (req, res) => {
  try {
    const forms = await Form.find({ createdBy: req.user.id }).sort({
      createdAt: -1,
    });

    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: "Failed to load forms" });
  }
});

// GET SINGLE FORM BY ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: "Invalid form ID format" });
    }

    const form = await Form.findById(id);

    if (!form) return res.status(404).json({ message: "Form not found" });

    if (form.expiresAt && new Date() > new Date(form.expiresAt)) {
      return res.status(410).json({ message: "Form expired" });
    }

    res.json(form);
  } catch (error) {
    res.status(500).json({ message: "Error loading form" });
  }
});

export default router;
