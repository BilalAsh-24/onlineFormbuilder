import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUri = process.env.MONGO_URI;

async function clearMongo() {
  if (!mongoUri) {
    console.error("❌ No MONGO_URI found in .env file!");
    process.exit(1);
  }

  try {
    console.log("🔌 Connecting to MongoDB cluster...");
    await mongoose.connect(mongoUri);
    console.log("✅ Connected successfully!");

    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();

    if (collections.length === 0) {
      console.log("ℹ️ No collections found in MongoDB. Database is already empty.");
    } else {
      console.log(`🗑️ Found ${collections.length} collections. Clearing them...`);
      for (const col of collections) {
        try {
          console.log(`Dropping collection: ${col.name}`);
          await db.collection(col.name).drop();
        } catch (colError) {
          console.warn(`⚠️ Failed to drop collection ${col.name}:`, colError.message);
        }
      }
      console.log("✅ All MongoDB collections cleared successfully!");
    }

    await mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error clearing MongoDB database:", error);
    process.exit(1);
  }
}

clearMongo();
