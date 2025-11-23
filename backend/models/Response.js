import mongoose from "mongoose";

const responseSchema = new mongoose.Schema({
  form: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Form",
    required: true,
  },
  respondentEmail: {
    type: String,
    required: true,
  },
  answers: [
    {
      questionText: String,
      answer: String,
    },
  ],
  submittedAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Response", responseSchema);
