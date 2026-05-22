import Form from "../models/Form.js";
import Question from "../models/Question.js";
import Option from "../models/Option.js";

export const getMyForms = async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { created_by: req.userId },
      order: [["form_id", "DESC"]],
    });
    res.json(forms);
  } catch (error) {
    console.error("GET MY FORMS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createForm = async (req, res) => {
  try {
    const { title, description, questions, expiresAt } = req.body;

    const form = await Form.create({
      title,
      description,
      created_by: req.userId,
      expires_at: expiresAt || null,
    });

    for (const q of questions) {
      const newQ = await Question.create({
        form_id: form.form_id,
        question_text: q.questionText,
        question_type: q.questionType,
        required: q.required || false,
      });

      if (q.options?.length) {
        await Promise.all(
          q.options.map((opt) =>
            Option.create({
              question_id: newQ.question_id,
              option_text: opt,
            })
          )
        );
      }
    }

    res.status(201).json({ message: "Form created", id: form.form_id });
  } catch (error) {
    console.error("CREATE FORM ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFormById = async (req, res) => {
  try {
    const formId = req.params.id;

    const form = await Form.findOne({
      where: { form_id: formId },
      include: [
        {
          model: Question,
          include: [{ model: Option }],
        },
      ],
    });

    if (!form)
      return res.status(404).json({ message: "Form not found" });

    res.json(form);
  } catch (error) {
    console.error("GET FORM ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateForm = async (req, res) => {
  try {
    const formId = req.params.id;
    const { title, description, questions, expiresAt } = req.body;

    // Find the form and verify ownership
    const form = await Form.findOne({
      where: { form_id: formId },
    });

    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.created_by !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to edit this form" });
    }

    // Update form metadata
    await form.update({
      title,
      description,
      expires_at: expiresAt || null,
    });

    // Delete existing questions (cascade will delete options)
    await Question.destroy({
      where: { form_id: formId },
    });

    // Create new questions
    for (const q of questions) {
      const newQ = await Question.create({
        form_id: formId,
        question_text: q.questionText,
        question_type: q.questionType,
        required: q.required || false,
      });

      if (q.options?.length) {
        await Promise.all(
          q.options.map((opt) =>
            Option.create({
              question_id: newQ.question_id,
              option_text: opt,
            })
          )
        );
      }
    }

    res.json({ message: "Form updated successfully", id: formId });
  } catch (error) {
    console.error("UPDATE FORM ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const formId = req.params.id;
    console.log("🗑️ DELETE REQUEST for form ID:", formId);

    // Find the form and verify ownership
    const form = await Form.findOne({
      where: { form_id: formId },
    });

    if (!form) {
      console.log("❌ Form not found:", formId);
      return res.status(404).json({ message: "Form not found" });
    }

    console.log("✅ Form found:", form.title, "Owner:", form.created_by, "User:", req.userId);

    if (form.created_by !== req.userId) {
      console.log("❌ Unauthorized delete attempt");
      return res.status(403).json({ message: "Unauthorized to delete this form" });
    }

    // Get all questions for this form
    const questions = await Question.findAll({
      where: { form_id: formId },
    });

    const questionIds = questions.map(q => q.question_id);
    console.log("📝 Found", questions.length, "questions with IDs:", questionIds);

    // Delete all answers for questions in this form
    if (questionIds.length > 0) {
      const Answer = (await import("../models/Answer.js")).default;
      const deletedAnswers = await Answer.destroy({
        where: { question_id: questionIds },
      });
      console.log("✅ Deleted", deletedAnswers, "answers");

      // Delete all options for questions in this form
      const deletedOptions = await Option.destroy({
        where: { question_id: questionIds },
      });
      console.log("✅ Deleted", deletedOptions, "options");
    }

    // Delete all responses for this form
    const Response = (await import("../models/Response.js")).default;
    const deletedResponses = await Response.destroy({
      where: { form_id: formId },
    });
    console.log("✅ Deleted", deletedResponses, "responses");

    // Delete all questions for this form
    const deletedQuestions = await Question.destroy({
      where: { form_id: formId },
    });
    console.log("✅ Deleted", deletedQuestions, "questions");

    // Finally, delete the form
    await form.destroy();
    console.log("✅ Form deleted successfully!");

    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE FORM ERROR:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
