import fs from "fs";
import path from "path";
import pool from "./connection";

export async function runMigrations(): Promise<void> {
  const migrationsDir = path.join(__dirname, "migrations");
  const migrationFiles = [
    "001_create_users_table.sql",
    "002_create_projects_table.sql",
    "003_create_plans_table.sql",
    "004_create_subscriptions_table.sql", // Agregar
    "005_create_invoices_table.sql", // Agregar
  ];

  console.log("🔄 Running database migrations...");

  for (const file of migrationFiles) {
    const filePath = path.join(migrationsDir, file);

    if (fs.existsSync(filePath)) {
      console.log(`📄 Executing migration: ${file}`);
      const sql = fs.readFileSync(filePath, "utf8");

      try {
        await pool.query(sql);
        console.log(`✅ Migration completed: ${file}`);
      } catch (error) {
        console.error(`❌ Migration failed: ${file}`, error);
        throw error;
      }
    } else {
      console.log(`⚠️ Migration file not found: ${file}`);
    }
  }

  console.log("✅ All migrations completed successfully");
}
