import { DataTypes } from "sequelize";
import sequelize from "../../config/db.js";
import User from "./User.js";

const Form = sequelize.define(
  "Form",
  {
    form_id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    title: { type: DataTypes.STRING, allowNull: false },
    description: { type: DataTypes.TEXT },
    created_by: { type: DataTypes.INTEGER, allowNull: false },
    expires_at: { type: DataTypes.DATE },
    allow_multiple_responses: { type: DataTypes.BOOLEAN, defaultValue: true },
  },
  { timestamps: false }
);

User.hasMany(Form, { foreignKey: "created_by" });
Form.belongsTo(User, { foreignKey: "created_by" });

export default Form;
