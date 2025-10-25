import { DatabaseHelper } from "./db.helper";
async function setupTestDatabase() {
  try {
    console.log("🧪 Setting up test database...");
    await DatabaseHelper.setupTestDB();
    console.log("✅ Test database setup complete");
    process.exit(0);
  } catch (error) {
    console.error("❌ Failed to setup test database:", error);
    process.exit(1);
  }
}
setupTestDatabase();
