import request from "supertest";
import { app } from "../../app";
import { DatabaseHelper } from "../helpers/db.helper";
import { AuthHelper } from "../helpers/auth.helper";

describe("Performance Tests", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  describe("Load Testing", () => {
    it("should handle multiple concurrent project creations", async () => {
      const startTime = Date.now();
      const numberOfRequests = 10;

      const promises = Array.from({ length: numberOfRequests }, (_, i) =>
        request(app)
          .post("/api/projects")
          .set(AuthHelper.getAuthHeaders())
          .send({
            title: `Load Test Project ${i}`,
            description: `Description ${i}`,
          })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verificar que todas las respuestas fueron exitosas
      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      // Verificar performance (debería completarse en menos de 5 segundos)
      expect(duration).toBeLessThan(5000);

      console.log(`✅ Created ${numberOfRequests} projects in ${duration}ms`);
      console.log(`📊 Average: ${duration / numberOfRequests}ms per request`);
    });

    it("should handle concurrent user registrations", async () => {
      const numberOfUsers = 5;
      const startTime = Date.now();

      const promises = Array.from({ length: numberOfUsers }, (_, i) =>
        request(app)
          .post("/api/auth/signup")
          .send({
            email: `loadtest${i}@example.com`,
            password: "password123",
            name: `Load Test User ${i}`,
          })
      );

      const responses = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;

      // Verificar que todas las respuestas fueron exitosas
      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });

      expect(duration).toBeLessThan(3000);
      console.log(`✅ Registered ${numberOfUsers} users in ${duration}ms`);
    });
  });

  describe("Memory and Resource Tests", () => {
    it("should not have memory leaks with large data sets", async () => {
      const initialMemory = process.memoryUsage();

      // Crear muchos proyectos
      for (let i = 0; i < 50; i++) {
        await request(app)
          .post("/api/projects")
          .set(AuthHelper.getAuthHeaders())
          .send({
            title: `Memory Test Project ${i}`,
            description: "x".repeat(1000), // Descripción grande
          });
      }

      // Obtener todos los proyectos
      await request(app)
        .get("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      // El incremento de memoria no debería ser excesivo (menos de 50MB)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024);

      console.log(
        `📊 Memory increase: ${Math.round(memoryIncrease / 1024 / 1024)}MB`
      );
    });
  });
});
