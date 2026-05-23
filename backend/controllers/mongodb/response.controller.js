import Response from "../../models/mongodb/Response.js";
import Form from "../../models/mongodb/Form.js";

export const submitResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const { respondentEmail, answers } = req.body;

    // Load the Form to check if multiple responses are allowed
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: "Form not found" });

    if (form.allow_multiple_responses === false) {
      const existing = await Response.findOne({
        form_id: formId,
        respondent_email: respondentEmail,
      });
      if (existing) {
        return res.status(400).json({ message: "You have already submitted a response for this form." });
      }
    }

    const answersData = answers.map((ans) => ({
      question_id: ans.question_id,
      answer_text: ans.answer,
    }));

    await Response.create({
      form_id: formId,
      respondent_email: respondentEmail,
      answers: answersData,
    });

    res.status(201).json({ message: "Response submitted" });
  } catch (error) {
    console.error("SUBMIT RESPONSE ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getResponses = async (req, res) => {
  try {
    const formId = req.params.id;

    // Fetch the form to map question IDs to question text
    const form = await Form.findById(formId);
    const qMap = {};
    if (form) {
      form.questions.forEach((q) => {
        qMap[q._id.toString()] = q.question_text;
      });
    }

    const responses = await Response.find({ form_id: formId });

    const formatted = responses.map((r) => ({
      respondentEmail: r.respondent_email,
      submittedAt: r.submitted_at,
      answers: r.answers.map((a) => ({
        questionText: qMap[a.question_id] || "Unknown Question",
        answer: a.answer_text,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET RESPONSES ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getRespondentResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email parameter is required" });
    }

    const response = await Response.findOne({
      form_id: formId,
      respondent_email: email,
    });

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    const formatted = {
      responseId: response._id.toString(),
      respondentEmail: response.respondent_email,
      answers: response.answers.map((a) => ({
        question_id: a.question_id,
        answer: a.answer_text,
      })),
    };

    res.json(formatted);
  } catch (error) {
    console.error("GET RESPONDENT RESPONSE ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const updateRespondentResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const { respondentEmail, answers } = req.body;

    if (!respondentEmail) {
      return res.status(400).json({ message: "Email is required" });
    }

    let response = await Response.findOne({
      form_id: formId,
      respondent_email: respondentEmail,
    });

    const answersData = answers.map((ans) => ({
      question_id: ans.question_id,
      answer_text: ans.answer,
    }));

    if (!response) {
      response = await Response.create({
        form_id: formId,
        respondent_email: respondentEmail,
        answers: answersData,
      });
    } else {
      response.answers = answersData;
      await response.save();
    }

    res.json({ message: "Response updated successfully" });
  } catch (error) {
    console.error("UPDATE RESPONDENT RESPONSE ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const deleteRespondentResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const { email } = req.query;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const response = await Response.findOne({
      form_id: formId,
      respondent_email: email,
    });

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    await Response.findByIdAndDelete(response._id);

    res.json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("DELETE RESPONDENT RESPONSE ERROR (MONGO):", error);
    res.status(500).json({ message: "Server error" });
  }
};
