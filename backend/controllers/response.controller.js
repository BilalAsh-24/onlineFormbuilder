import Response from "../models/Response.js";
import Answer from "../models/Answer.js";
import Question from "../models/Question.js";

export const submitResponse = async (req, res) => {
  try {
    const formId = req.params.id;
    const { respondentEmail, answers } = req.body;

    const response = await Response.create({
      form_id: formId,
      respondent_email: respondentEmail,
    });

    for (const ans of answers) {
      await Answer.create({
        response_id: response.response_id,
        question_id: ans.question_id,
        answer_text: ans.answer,
      });
    }

    res.status(201).json({ message: "Response submitted" });
  } catch (error) {
    console.error("SUBMIT RESPONSE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getResponses = async (req, res) => {
  try {
    const formId = req.params.id;

    const responses = await Response.findAll({
      where: { form_id: formId },
      include: [
        {
          model: Answer,
          include: [
            {
              model: Question,
              attributes: ["question_text"],
            },
          ],
        },
      ],
    });

    const formatted = responses.map((r) => ({
      respondentEmail: r.respondent_email,
      submittedAt: r.submitted_at,
      answers: r.Answers.map((a) => ({
        questionText: a.Question.question_text,
        answer: a.answer_text,
      })),
    }));

    res.json(formatted);
  } catch (error) {
    console.error("GET RESPONSES ERROR:", error);
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
      where: { form_id: formId, respondent_email: email },
      include: [
        {
          model: Answer,
        },
      ],
    });

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    const formatted = {
      responseId: response.response_id,
      respondentEmail: response.respondent_email,
      answers: response.Answers.map((a) => ({
        question_id: a.question_id,
        answer: a.answer_text,
      })),
    };

    res.json(formatted);
  } catch (error) {
    console.error("GET RESPONDENT RESPONSE ERROR:", error);
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
      where: { form_id: formId, respondent_email: respondentEmail },
    });

    if (!response) {
      response = await Response.create({
        form_id: formId,
        respondent_email: respondentEmail,
      });
    }

    // Delete existing answers for this response
    await Answer.destroy({
      where: { response_id: response.response_id },
    });

    // Create new answers
    for (const ans of answers) {
      await Answer.create({
        response_id: response.response_id,
        question_id: ans.question_id,
        answer_text: ans.answer,
      });
    }

    res.json({ message: "Response updated successfully" });
  } catch (error) {
    console.error("UPDATE RESPONDENT RESPONSE ERROR:", error);
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
      where: { form_id: formId, respondent_email: email },
    });

    if (!response) {
      return res.status(404).json({ message: "Response not found" });
    }

    // Delete answers first
    await Answer.destroy({
      where: { response_id: response.response_id },
    });

    // Delete the response
    await response.destroy();

    res.json({ message: "Response deleted successfully" });
  } catch (error) {
    console.error("DELETE RESPONDENT RESPONSE ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};

