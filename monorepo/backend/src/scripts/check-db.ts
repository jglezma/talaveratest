import dotenv from "dotenv";
import { Pool } from "pg";

dotenv.config();

const checkDatabase = async () => {
  console.log("🔍 Checking database configuration...");

  // Mostrar variables de entorno
  console.log("📋 Environment variables:");
  console.log("  DB_HOST:", process.env.DB_HOST || "localhost");
  console.log("  DB_PORT:", process.env.DB_PORT || "5432");
  console.log("  DB_NAME:", process.env.DB_NAME || "talaveratest");
  console.log("  DB_USER:", process.env.DB_USER || "postgres");
  console.log("  DB_PASSWORD:", process.env.DB_PASSWORD ? "***" : "NOT SET");
  console.log("  DATABASE_URL:", process.env.DATABASE_URL ? "***" : "NOT SET");

  const pool = new Pool({
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME || "talaveratest",
    user: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
  });

  try {
    console.log("\n🔌 Testing connection...");
    const client = await pool.connect();

    const result = await client.query("SELECT NOW(), version()");
    console.log("✅ Connection successful!");
    console.log("🕒 Server time:", result.rows[0].now);
    console.log("🐘 PostgreSQL version:", result.rows[0].version.split(" ")[0]);

    client.release();
    await pool.end();
  } catch (error) {
    console.error("❌ Connection failed:", error);
    process.exit(1);
  }
};

checkDatabase();
