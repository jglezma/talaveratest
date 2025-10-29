import pool from "../../database/connection";

export class DatabaseHelper {
  static async setupTestDB(): Promise<void> {
    try {
      console.log("🧪 Setting up test database...");

      // Limpiar la base de datos
      await this.cleanTestDB();

      // Crear las tablas básicas
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

  static async cleanProjects(): Promise<void> {
    try {
      await pool.query("DELETE FROM projects;");
      console.log("🧹 Projects cleaned");
    } catch (error) {
      console.error("❌ Error cleaning projects:", error);
      throw error;
    }
  }

  static async cleanUsers(): Promise<void> {
    try {
      await pool.query("DELETE FROM users WHERE email != 'test@example.com';");
      console.log("🧹 Users cleaned (keeping test user)");
    } catch (error) {
      console.error("❌ Error cleaning users:", error);
      throw error;
    }
  }

  static async cleanSubscriptions(): Promise<void> {
    try {
      await pool.query("DELETE FROM subscriptions WHERE user_id != 1;");
      console.log("🧹 Subscriptions cleaned");
    } catch (error) {
      console.error("❌ Error cleaning subscriptions:", error);
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

      // Triggers
      await pool.query(`
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
        CREATE TRIGGER update_users_updated_at 
          BEFORE UPDATE ON users
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
      `);

      await pool.query(`
        DROP TRIGGER IF EXISTS update_projects_updated_at ON projects;
        CREATE TRIGGER update_projects_updated_at 
          BEFORE UPDATE ON projects
          FOR EACH ROW 
          EXECUTE FUNCTION update_updated_at_column();
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

  static async createTestUser(userData: {
    email: string;
    name: string;
    password_hash: string;
  }): Promise<number> {
    try {
      const result = await pool.query(
        "INSERT INTO users (email, name, password_hash) VALUES ($1, $2, $3) RETURNING id",
        [userData.email, userData.name, userData.password_hash]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error("❌ Error creating test user:", error);
      throw error;
    }
  }

  static async getTableRowCount(tableName: string): Promise<number> {
    try {
      const result = await pool.query(`SELECT COUNT(*) FROM ${tableName}`);
      return parseInt(result.rows[0].count);
    } catch (error) {
      console.error(`❌ Error counting rows in ${tableName}:`, error);
      throw error;
    }
  }

  static async executeRawQuery(
    query: string,
    params: any[] = []
  ): Promise<any> {
    try {
      return await pool.query(query, params);
    } catch (error) {
      console.error("❌ Error executing raw query:", error);
      throw error;
    }
  }

  static async createTestSubscription(
    userId: number,
    planId: number
  ): Promise<number> {
    try {
      const result = await pool.query(
        `
        INSERT INTO subscriptions (user_id, plan_id, status, current_period_start, current_period_end)
        VALUES ($1, $2, 'trialing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '1 month')
        RETURNING id
      `,
        [userId, planId]
      );
      return result.rows[0].id;
    } catch (error) {
      console.error("❌ Error creating test subscription:", error);
      throw error;
    }
  }

  static async waitForDatabaseOperation(
    operation: () => Promise<any>,
    maxRetries = 5
  ): Promise<any> {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        if (i === maxRetries - 1) throw error;
        await new Promise((resolve) => setTimeout(resolve, 100 * (i + 1)));
      }
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
