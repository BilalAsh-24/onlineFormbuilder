import sequelize from "./config/db.js";
import User from "./models/mysql/User.js";
import Form from "./models/mysql/Form.js";
import Question from "./models/mysql/Question.js";
import Option from "./models/mysql/Option.js";
import Response from "./models/mysql/Response.js";
import Answer from "./models/mysql/Answer.js";

async function clearDatabase() {
    try {
        console.log("🗑️  Starting database cleanup...");

        // Disable foreign key checks temporarily
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");

        // Truncate all tables in the correct order
        console.log("Deleting Answers...");
        await Answer.destroy({ where: {}, truncate: true });

        console.log("Deleting Options...");
        await Option.destroy({ where: {}, truncate: true });

        console.log("Deleting Responses...");
        await Response.destroy({ where: {}, truncate: true });

        console.log("Deleting Questions...");
        await Question.destroy({ where: {}, truncate: true });

        console.log("Deleting Forms...");
        await Form.destroy({ where: {}, truncate: true });

        console.log("Deleting Users...");
        await User.destroy({ where: {}, truncate: true });

        // Re-enable foreign key checks
        await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");

        console.log("✅ Database cleared successfully!");
        console.log("All tables are now empty. You can start fresh!");

        process.exit(0);
    } catch (error) {
        console.error("❌ Error clearing database:", error);
        process.exit(1);
    }
}

clearDatabase();
