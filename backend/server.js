import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import formRoutes from "./routes/form.routes.js";
import responseRoutes from "./routes/response.routes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);

// Start Server + Sync Database
const PORT = process.env.PORT || 8000;

connectDB()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT} [DB_TYPE=${process.env.DB_TYPE || "mysql"}]`)
    );
  })
  .catch((err) => {
    console.error("Database Connection/Sync Error:", err);
    process.exit(1);
  });
