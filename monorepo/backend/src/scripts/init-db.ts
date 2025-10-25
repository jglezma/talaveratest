import dotenv from "dotenv";
import { runMigrations, testConnection } from "../database/connection";

dotenv.config();

const initializeDatabase = async () => {
  try {
    console.log("🚀 Initializing database...");

    await testConnection();
    console.log("✅ Database connection successful");

    await runMigrations();
    console.log("✅ Database initialization completed");

    process.exit(0);
  } catch (error) {
    console.error("❌ Database initialization failed:", error);
    process.exit(1);
  }
};

initializeDatabase();
