import Form from "../../models/mysql/Form.js";
import Question from "../../models/mysql/Question.js";
import Option from "../../models/mysql/Option.js";

export const getMyForms = async (req, res) => {
  try {
    const forms = await Form.findAll({
      where: { created_by: req.userId },
      order: [["form_id", "DESC"]],
    });
    const formatted = forms.map((f) => ({
      form_id: f.form_id,
      title: f.title,
      description: f.description,
      created_by: f.created_by,
      expires_at: f.expires_at,
      allowMultipleResponses: f.allow_multiple_responses,
    }));
    res.json(formatted);
  } catch (error) {
    console.error("GET MY FORMS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createForm = async (req, res) => {
  try {
    const { title, description, questions, expiresAt, allowMultipleResponses } = req.body;

    const form = await Form.create({
      title,
      description,
      created_by: req.userId,
      expires_at: expiresAt || null,
      allow_multiple_responses: allowMultipleResponses !== undefined ? allowMultipleResponses : true,
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

    const formatted = {
      form_id: form.form_id,
      title: form.title,
      description: form.description,
      created_by: form.created_by,
      expires_at: form.expires_at,
      allowMultipleResponses: form.allow_multiple_responses,
      Questions: form.Questions.map((q) => ({
        question_id: q.question_id,
        question_text: q.question_text,
        question_type: q.question_type,
        required: q.required,
        form_id: form.form_id,
        Options: q.Options.map((opt) => ({
          option_id: opt.option_id,
          option_text: opt.option_text,
          question_id: q.question_id,
        })),
      })),
    };
    res.json(formatted);
  } catch (error) {
    console.error("GET FORM ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateForm = async (req, res) => {
  try {
    const formId = req.params.id;
    const { title, description, questions, expiresAt, allowMultipleResponses } = req.body;

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
      allow_multiple_responses: allowMultipleResponses !== undefined ? allowMultipleResponses : true,
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
      const Answer = (await import("../../models/mysql/Answer.js")).default;
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
    const Response = (await import("../../models/mysql/Response.js")).default;
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
