import dotenv from "dotenv";
import { getClient } from "../database/connection";

dotenv.config();

const resetDatabase = async () => {
  const client = await getClient();

  try {
    console.log("🔄 Resetting database...");

    // Eliminar todas las tablas
    await client.query("DROP TABLE IF EXISTS invoices CASCADE;");
    await client.query("DROP TABLE IF EXISTS projects CASCADE;");
    await client.query("DROP TABLE IF EXISTS plans CASCADE;");
    await client.query("DROP TABLE IF EXISTS users CASCADE;");
    await client.query("DROP TABLE IF EXISTS migrations CASCADE;");

    // Eliminar función si existe
    await client.query(
      "DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;"
    );

    console.log("✅ Database reset completed");
  } catch (error) {
    console.error("❌ Database reset failed:", error);
    throw error;
  } finally {
    client.release();
  }
};

resetDatabase()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
