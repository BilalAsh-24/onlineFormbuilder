import mongoose from "mongoose";

const formSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  questions: [
    {
      questionText: String,
      questionType: {
        type: String,
        enum: ["text", "multipleChoice"],
        default: "text",
      },
      options: [String],
      required: {
        type: Boolean,
        default: false,
      },
    },
  ],
  expiresAt: Date,
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model("Form", formSchema);
