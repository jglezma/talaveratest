import { config } from "dotenv";

// Cargar variables de entorno de test
config({ path: ".env.test" });

// Configuración global para tests
process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-jwt-secret";
process.env.DB_NAME = "talaveratest_test";

// Aumentar timeout para operaciones de base de datos
jest.setTimeout(30000);
