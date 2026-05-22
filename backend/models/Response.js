import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import Form from "./Form.js";

const Response = sequelize.define(
  "Response",
  {
    response_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    respondent_email: { type: DataTypes.STRING },
    submitted_at: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { timestamps: false }
);

Form.hasMany(Response, { foreignKey: "form_id" });
Response.belongsTo(Form, { foreignKey: "form_id" });

export default Response;
