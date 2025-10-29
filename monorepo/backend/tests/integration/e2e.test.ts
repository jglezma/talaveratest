import request from "supertest";
import { app } from "../../app";
import { DatabaseHelper } from "../helpers/db.helper";

describe("End-to-End Integration Tests", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  describe("Complete User Journey", () => {
    it("should complete full user workflow: signup -> login -> create project -> subscribe -> manage subscription", async () => {
      // 1. Registro de usuario
      const userData = {
        email: "e2e-user@test.com",
        password: "password123",
        name: "E2E Test User",
      };

      const signupResponse = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(201);

      expect(signupResponse.body.success).toBe(true);
      const userToken = signupResponse.body.data.token;

      // 2. Login (verificar que el token funciona)
      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({ email: userData.email, password: userData.password })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);

      // 3. Crear proyecto
      const projectData = {
        title: "E2E Test Project",
        description: "Project created during E2E test",
      };

      const projectResponse = await request(app)
        .post("/api/projects")
        .set({ Authorization: `Bearer ${userToken}` })
        .send(projectData)
        .expect(201);

      expect(projectResponse.body.success).toBe(true);
      const projectId = projectResponse.body.data.id;

      // 4. Verificar perfil de usuario
      const profileResponse = await request(app)
        .get("/api/auth/profile")
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200);

      expect(profileResponse.body.data.email).toBe(userData.email);

      // 5. Suscribirse a un plan
      const subscriptionResponse = await request(app)
        .post("/api/subscriptions")
        .set({ Authorization: `Bearer ${userToken}` })
        .send({ plan_id: 1 })
        .expect(201);

      expect(subscriptionResponse.body.success).toBe(true);

      // 6. Verificar suscripción actual
      const currentSubResponse = await request(app)
        .get("/api/subscriptions/current")
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200);

      expect(currentSubResponse.body.data.plan_id).toBe(1);

      // 7. Actualizar proyecto
      const updateResponse = await request(app)
        .put(`/api/projects/${projectId}`)
        .set({ Authorization: `Bearer ${userToken}` })
        .send({ title: "Updated E2E Project" })
        .expect(200);

      expect(updateResponse.body.data.title).toBe("Updated E2E Project");

      // 8. Obtener lista de proyectos
      const projectsResponse = await request(app)
        .get("/api/projects")
        .set({ Authorization: `Bearer ${userToken}` })
        .expect(200);

      expect(projectsResponse.body.data.length).toBe(1);

      // 9. Cambiar plan de suscripción
      const upgradeResponse = await request(app)
        .put("/api/subscriptions/current")
        .set({ Authorization: `Bearer ${userToken}` })
        .send({ plan_id: 2 })
        .expect(200);

      expect(upgradeResponse.body.data.plan_id).toBe(2);

      console.log("✅ Complete user journey test passed!");
    });
  });

  describe("Multi-User Scenarios", () => {
    it("should handle multiple users with isolated data", async () => {
      // Crear dos usuarios
      const users = [
        { email: "user1@test.com", password: "pass1", name: "User 1" },
        { email: "user2@test.com", password: "pass2", name: "User 2" },
      ];

      const tokens = [];

      // Registrar usuarios
      for (const user of users) {
        const response = await request(app)
          .post("/api/auth/signup")
          .send(user)
          .expect(201);
        tokens.push(response.body.data.token);
      }

      // Cada usuario crea proyectos
      for (let i = 0; i < tokens.length; i++) {
        await request(app)
          .post("/api/projects")
          .set({ Authorization: `Bearer ${tokens[i]}` })
          .send({
            title: `User ${i + 1} Project 1`,
            description: `Project by user ${i + 1}`,
          })
          .expect(201);

        await request(app)
          .post("/api/projects")
          .set({ Authorization: `Bearer ${tokens[i]}` })
          .send({
            title: `User ${i + 1} Project 2`,
            description: `Second project by user ${i + 1}`,
          })
          .expect(201);
      }

      // Verificar que cada usuario ve solo sus proyectos
      for (let i = 0; i < tokens.length; i++) {
        const response = await request(app)
          .get("/api/projects")
          .set({ Authorization: `Bearer ${tokens[i]}` })
          .expect(200);

        expect(response.body.data.length).toBe(2);
        response.body.data.forEach((project) => {
          expect(project.title).toContain(`User ${i + 1}`);
        });
      }
    });
  });
});
