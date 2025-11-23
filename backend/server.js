import authRoutes from "./routes/auth.js";
import formRoutes from "./routes/formRoutes.js";
import { logger } from "./middleware/loggerMiddleware.js";
import responseRoutes from "./routes/responseRoutes.js";
import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});
app.use(logger);

// connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => console.log("❌ MongoDB connection failed:", err));

  app.use("/api/auth", authRoutes);
  app.use("/api/forms", formRoutes);
app.use("/api/responses", responseRoutes);


app.get("/", (req, res) => {
  res.type("text/plain").send("Server is working fine!");
});


const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
