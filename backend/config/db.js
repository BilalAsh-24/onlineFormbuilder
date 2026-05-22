import { Sequelize } from "sequelize";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

let sequelize = null;

if (process.env.DB_TYPE === "mysql" || !process.env.DB_TYPE) {
  if (process.env.DATABASE_URL) {
    sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "mysql",
      logging: console.log, // show SQL queries
    });
  } else {
    sequelize = new Sequelize(
      process.env.DB_NAME || "formbuilder",
      process.env.DB_USER || "root",
      process.env.DB_PASSWORD || "Mbappe@10",
      {
        host: process.env.DB_HOST || "localhost",
        dialect: "mysql",
        logging: console.log, // show SQL queries
      }
    );
  }
}

export const connectDB = async () => {
  const dbType = process.env.DB_TYPE || "mysql";
  if (dbType === "mongodb") {
    console.log("Connecting to MongoDB Atlas...");
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected Successfully 🍃");
  } else {
    console.log("Connecting and syncing MySQL...");
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("MySQL Connected & Synced Successfully 👍");
  }
};

export default sequelize;
