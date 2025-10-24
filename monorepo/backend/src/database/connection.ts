import { Pool } from "pg";
import fs from "fs";
import path from "path";

const pool = new Pool({
  connectionString:
    process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/talaveratest",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const runMigrations = async (): Promise<void> => {
  try {
    const migrationsDir = path.join(__dirname, "migrations");
    const migrationFiles = fs.readdirSync(migrationsDir).sort();

    console.log("Running migrations...");

    for (const file of migrationFiles) {
      if (file.endsWith(".sql")) {
        console.log(`Running migration: ${file}`);
        const migrationSQL = fs.readFileSync(
          path.join(migrationsDir, file),
          "utf8"
        );
        await pool.query(migrationSQL);
        console.log(`✓ Migration ${file} completed`);
      }
    }

    console.log("All migrations completed successfully");
  } catch (error) {
    console.error("Migration failed:", error);
    throw error;
  }
};

export const testConnection = async (): Promise<boolean> => {
  try {
    await pool.query("SELECT 1");
    console.log("✓ Database connected successfully");
    return true;
  } catch (error) {
    console.error("Database connection failed:", error);
    return false;
  }
};

export default pool;
