import { Pool } from "pg";
import fs from "fs";
import path from "path";

// Configuración de conexión más explícita
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "talaveratest",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
};

console.log("🔧 Database config:", {
  ...dbConfig,
  password: "***",
});

const pool = new Pool(dbConfig);

export const query = (text: string, params?: any[]) => {
  return pool.query(text, params);
};

export const getClient = () => {
  return pool.connect();
};

export const testConnection = async (): Promise<void> => {
  const client = await getClient();
  try {
    const result = await client.query(
      "SELECT NOW() as current_time, version() as pg_version"
    );
    console.log("📡 Database connection test successful");
    console.log("🕒 Server time:", result.rows[0].current_time);
    console.log(
      "🐘 PostgreSQL version:",
      result.rows[0].pg_version.split(" ")[0]
    );
  } finally {
    client.release();
  }
};

export const runMigrations = async (): Promise<void> => {
  const client = await getClient();

  try {
    console.log("🏗️  Setting up migration tracking...");

    // Crear tabla de migraciones si no existe
    await client.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    const migrationsDir = path.join(__dirname, "migrations");

    // Verificar que el directorio de migraciones existe
    if (!fs.existsSync(migrationsDir)) {
      console.log("📁 Creating migrations directory...");
      fs.mkdirSync(migrationsDir, { recursive: true });
      console.log("✅ Migrations directory created");
      return;
    }

    const migrationFiles = fs
      .readdirSync(migrationsDir)
      .filter((file) => file.endsWith(".sql"))
      .sort();

    if (migrationFiles.length === 0) {
      console.log("📝 No migration files found");
      return;
    }

    console.log(`📋 Found ${migrationFiles.length} migration files`);

    for (const file of migrationFiles) {
      // Verificar si la migración ya se ejecutó
      const { rows } = await client.query(
        "SELECT id FROM migrations WHERE filename = $1",
        [file]
      );

      if (rows.length === 0) {
        console.log(`🔄 Executing migration: ${file}`);

        const sqlContent = fs.readFileSync(
          path.join(migrationsDir, file),
          "utf8"
        );

        await client.query("BEGIN");

        try {
          // Ejecutar todo el archivo como un solo statement
          console.log(`   📝 Executing migration content`);
          await client.query(sqlContent);

          await client.query("INSERT INTO migrations (filename) VALUES ($1)", [
            file,
          ]);

          await client.query("COMMIT");
          console.log(`✅ Migration ${file} executed successfully`);
        } catch (error) {
          await client.query("ROLLBACK");
          console.error(`❌ Error executing migration ${file}:`, error);
          throw error;
        }
      } else {
        console.log(`⏭️  Migration ${file} already executed, skipping`);
      }
    }

    console.log("🎉 All migrations completed");
  } finally {
    client.release();
  }
};

export default pool;
