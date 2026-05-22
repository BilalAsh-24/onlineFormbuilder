import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();

let sequelize;

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

export default sequelize;
