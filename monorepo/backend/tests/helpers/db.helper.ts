import pool from "../../database/connection";

export class DatabaseHelper {
  static async setupTestDB(): Promise<void> {
    try {
      console.log("🧪 Setting up test database...");

      // Limpiar la base de datos
      await this.cleanTestDB();

      // Crear las tablas básicas (sin ejecutar todas las migraciones)
      await this.createTestTables();

      // Insertar datos de prueba
      await this.insertTestData();

      console.log("✅ Test database setup complete");
    } catch (error) {
      console.error("❌ Error setting up test database:", error);
      throw error;
    }
  }

  static async cleanTestDB(): Promise<void> {
    try {
      console.log("🧹 Cleaning test database...");

      // Eliminar todas las tablas en orden
      await pool.query("DROP TABLE IF EXISTS invoices CASCADE;");
      await pool.query("DROP TABLE IF EXISTS subscriptions CASCADE;");
      await pool.query("DROP TABLE IF EXISTS projects CASCADE;");
      await pool.query("DROP TABLE IF EXISTS plans CASCADE;");
      await pool.query("DROP TABLE IF EXISTS users CASCADE;");
      await pool.query("DROP TABLE IF EXISTS migration_history CASCADE;");

      console.log("✅ Test database cleaned");
    } catch (error) {
      console.error("❌ Error cleaning test database:", error);
      throw error;
    }
  }

  static async createTestTables(): Promise<void> {
    try {
      console.log("🏗️ Creating test tables...");

      // Función para updated_at
      await pool.query(`
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = CURRENT_TIMESTAMP;
            RETURN NEW;
        END;
        $$ language 'plpgsql';
      `);

      // Tabla users
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            name VARCHAR(255) NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla projects
      await pool.query(`
        CREATE TABLE IF NOT EXISTS projects (
            id SERIAL PRIMARY KEY,
            user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            title VARCHAR(255) NOT NULL,
            description TEXT,
            status VARCHAR(50) DEFAULT 'active',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Tabla plans
      await pool.query(`
        CREATE TABLE IF NOT EXISTS plans (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            description TEXT,
            price DECIMAL(10,2) NOT NULL,
            features TEXT[],
            billing_period VARCHAR(20) DEFAULT 'monthly',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log("✅ Test tables created");
    } catch (error) {
      console.error("❌ Error creating test tables:", error);
      throw error;
    }
  }

  static async insertTestData(): Promise<void> {
    try {
      console.log("📝 Inserting test data...");

      // Insertar usuario de prueba
      await pool.query(`
        INSERT INTO users (email, name, password_hash) 
        VALUES ('test@example.com', 'Test User', '$2a$10$test.hash.example') 
        ON CONFLICT (email) DO NOTHING;
      `);

      // Insertar planes de prueba
      await pool.query(`
        INSERT INTO plans (name, description, price, features, billing_period) 
        VALUES 
        ('Basic', 'Plan básico', 9.99, ARRAY['Feature 1', 'Feature 2'], 'monthly'),
        ('Pro', 'Plan profesional', 19.99, ARRAY['Feature 1', 'Feature 2', 'Feature 3'], 'monthly')
        ON CONFLICT DO NOTHING;
      `);

      console.log("✅ Test data inserted");
    } catch (error) {
      console.error("❌ Error inserting test data:", error);
      throw error;
    }
  }

  static async closeConnection(): Promise<void> {
    try {
      await pool.end();
      console.log("🔌 Test database connection closed");
    } catch (error) {
      console.error("❌ Error closing test database connection:", error);
    }
  }
}
