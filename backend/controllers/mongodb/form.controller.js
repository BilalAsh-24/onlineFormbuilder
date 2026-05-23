import Form from "../../models/mongodb/Form.js";
import Response from "../../models/mongodb/Response.js";

export const getMyForms = async (req, res) => {
  try {
    const forms = await Form.find({ created_by: req.userId }).sort({ _id: -1 });
    
    const formatted = forms.map((f) => ({
      form_id: f._id.toString(),
      title: f.title,
      description: f.description,
      created_by: f.created_by,
      expires_at: f.expires_at,
      allowMultipleResponses: f.allow_multiple_responses,
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET MY FORMS ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const createForm = async (req, res) => {
  try {
    const { title, description, questions, expiresAt, allowMultipleResponses } = req.body;

    const questionsData = questions.map((q) => ({
      question_text: q.questionText,
      question_type: q.questionType,
      required: q.required || false,
      options: q.options?.map((opt) => ({ option_text: opt })) || [],
    }));

    const form = await Form.create({
      title,
      description,
      created_by: req.userId,
      expires_at: expiresAt || null,
      allow_multiple_responses: allowMultipleResponses !== undefined ? allowMultipleResponses : true,
      questions: questionsData,
    });

    res.status(201).json({ message: "Form created", id: form._id.toString() });
  } catch (error) {
    console.error("CREATE FORM ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFormById = async (req, res) => {
  try {
    const formId = req.params.id;

    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    const formatted = {
      form_id: form._id.toString(),
      title: form.title,
      description: form.description,
      created_by: form.created_by,
      expires_at: form.expires_at,
      allowMultipleResponses: form.allow_multiple_responses,
      Questions: form.questions.map((q) => ({
        question_id: q._id.toString(),
        question_text: q.question_text,
        question_type: q.question_type,
        required: q.required,
        form_id: form._id.toString(),
        Options: q.options.map((opt) => ({
          option_id: opt._id.toString(),
          option_text: opt.option_text,
          question_id: q._id.toString(),
        })),
      })),
    };

    res.json(formatted);
  } catch (error) {
    console.error("GET FORM ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateForm = async (req, res) => {
  try {
    const formId = req.params.id;
    const { title, description, questions, expiresAt, allowMultipleResponses } = req.body;

    const form = await Form.findById(formId);
    if (!form) {
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.created_by !== req.userId) {
      return res.status(403).json({ message: "Unauthorized to edit this form" });
    }

    const questionsData = questions.map((q) => ({
      question_text: q.questionText,
      question_type: q.questionType,
      required: q.required || false,
      options: q.options?.map((opt) => ({ option_text: opt })) || [],
    }));

    form.title = title;
    form.description = description;
    form.expires_at = expiresAt || null;
    form.allow_multiple_responses = allowMultipleResponses !== undefined ? allowMultipleResponses : true;
    form.questions = questionsData;

    await form.save();

    res.json({ message: "Form updated successfully", id: formId });
  } catch (error) {
    console.error("UPDATE FORM ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteForm = async (req, res) => {
  try {
    const formId = req.params.id;
    console.log("🗑️ DELETE REQUEST (MONGO) for form ID:", formId);

    const form = await Form.findById(formId);
    if (!form) {
      console.log("❌ Form not found:", formId);
      return res.status(404).json({ message: "Form not found" });
    }

    if (form.created_by !== req.userId) {
      console.log("❌ Unauthorized delete attempt");
      return res.status(403).json({ message: "Unauthorized to delete this form" });
    }

    // Delete all responses for this form
    const deletedResponses = await Response.deleteMany({ form_id: formId });
    console.log("✅ Deleted", deletedResponses.deletedCount, "responses");

    // Finally, delete the form itself
    await Form.findByIdAndDelete(formId);
    console.log("✅ Form deleted successfully!");

    res.json({ message: "Form deleted successfully" });
  } catch (error) {
    console.error("❌ DELETE FORM ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
