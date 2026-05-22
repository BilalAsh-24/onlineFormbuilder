import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import Form from "./Form.js";

const Question = sequelize.define(
  "Question",
  {
    question_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    question_text: { type: DataTypes.TEXT, allowNull: false },
    question_type: { type: DataTypes.STRING, allowNull: false },
    required: { type: DataTypes.BOOLEAN, defaultValue: false },
  },
  { timestamps: false }
);

Form.hasMany(Question, { foreignKey: "form_id" });
Question.belongsTo(Form, { foreignKey: "form_id" });

export default Question;
