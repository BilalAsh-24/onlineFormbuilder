import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Question from "./Question.js";

const Option = sequelize.define(
  "Option",
  {
    option_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    option_text: { type: DataTypes.STRING },
  },
  { timestamps: false }
);

Question.hasMany(Option, { foreignKey: "question_id" });
Option.belongsTo(Question, { foreignKey: "question_id" });

export default Option;
