import mongoose from "mongoose";

const OptionSchema = new mongoose.Schema({
  option_text: { type: String, required: true },
});

const QuestionSchema = new mongoose.Schema({
  question_text: { type: String, required: true },
  question_type: { type: String, required: true },
  required: { type: Boolean, default: false },
  options: [OptionSchema],
});

const FormSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    created_by: { type: String, required: true },
    expires_at: { type: Date, default: null },
    questions: [QuestionSchema],
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

const Form = mongoose.model("Form", FormSchema);
export default Form;
