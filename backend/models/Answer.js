import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Response from "./Response.js";
import Question from "./Question.js";

const Answer = sequelize.define(
  "Answer",
  {
    answer_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    answer_text: { type: DataTypes.TEXT },
  },
  { timestamps: false }
);

Response.hasMany(Answer, { foreignKey: "response_id" });
Answer.belongsTo(Response, { foreignKey: "response_id" });

Question.hasMany(Answer, { foreignKey: "question_id" });
Answer.belongsTo(Question, { foreignKey: "question_id" });

export default Answer;
