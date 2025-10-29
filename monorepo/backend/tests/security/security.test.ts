import request from "supertest";
import { app } from "../../app";
import { DatabaseHelper } from "../helpers/db.helper";
import { AuthHelper } from "../helpers/auth.helper";
import jwt from "jsonwebtoken";

describe("Security Tests", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  describe("Authentication Security", () => {
    it("should prevent JWT token tampering", async () => {
      const validToken = AuthHelper.generateTestToken();
      const tamperedToken = validToken.slice(0, -5) + "XXXXX";

      const response = await request(app)
        .get("/api/projects")
        .set({ Authorization: `Bearer ${tamperedToken}` })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid or expired token");
    });

    it("should prevent token replay attacks with expired tokens", async () => {
      const expiredToken = jwt.sign(
        { id: 1, email: "test@example.com" },
        process.env.JWT_SECRET || "test-jwt-secret",
        { expiresIn: "-1h" } // Token expirado
      );

      const response = await request(app)
        .get("/api/projects")
        .set({ Authorization: `Bearer ${expiredToken}` })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it("should prevent cross-user data access", async () => {
      // Crear proyecto con usuario 1
      const user1Token = AuthHelper.generateTestToken(1, "user1@test.com");
      const createResponse = await request(app)
        .post("/api/projects")
        .set({ Authorization: `Bearer ${user1Token}` })
        .send({ title: "User 1 Project", description: "Private project" });

      const projectId = createResponse.body.data.id;

      // Intentar acceder con usuario 2
      const user2Token = AuthHelper.generateTestToken(2, "user2@test.com");
      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set({ Authorization: `Bearer ${user2Token}` })
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Input Validation Security", () => {
    it("should prevent SQL injection in project title", async () => {
      const maliciousTitle = "'; DROP TABLE projects; --";

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send({
          title: maliciousTitle,
          description: "Test description",
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(maliciousTitle);

      // Verificar que la tabla projects todavía existe
      const projectsResponse = await request(app)
        .get("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(projectsResponse.body.success).toBe(true);
    });

    it("should handle XSS attempts in input fields", async () => {
      const xssPayload = '<script>alert("XSS")</script>';

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send({
          title: "Normal Title",
          description: xssPayload,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      // El payload debería guardarse como texto plano
      expect(response.body.data.description).toBe(xssPayload);
    });

    it("should handle extremely long input strings", async () => {
      const longString = "x".repeat(10000);

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send({
          title: "Long Content Test",
          description: longString,
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.description.length).toBe(10000);
    });
  });

  describe("Rate Limiting Simulation", () => {
    it("should handle rapid successive requests gracefully", async () => {
      const requests = Array.from({ length: 20 }, () =>
        request(app)
          .post("/api/projects")
          .set(AuthHelper.getAuthHeaders())
          .send({
            title: "Rate limit test",
            description: "Testing rapid requests",
          })
      );

      const responses = await Promise.all(requests);

      // Todas las respuestas deberían ser válidas (sin rate limiting implementado aún)
      responses.forEach((response) => {
        expect([201, 429]).toContain(response.status); // 201 success o 429 rate limited
      });
    });
  });
});
