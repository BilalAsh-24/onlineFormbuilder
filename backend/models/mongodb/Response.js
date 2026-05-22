import mongoose from "mongoose";

const AnswerSchema = new mongoose.Schema({
  question_id: { type: String, required: true },
  answer_text: { type: String, default: "" },
});

const ResponseSchema = new mongoose.Schema(
  {
    form_id: { type: String, required: true },
    respondent_email: { type: String, required: true },
    submitted_at: { type: Date, default: Date.now },
    answers: [AnswerSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Response = mongoose.model("Response", ResponseSchema);
export default Response;
