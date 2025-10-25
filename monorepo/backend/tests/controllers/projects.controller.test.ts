import request from "supertest";
import { app } from "../../app";
import { DatabaseHelper } from "../helpers/db.helper";
import { AuthHelper } from "../helpers/auth.helper";

describe("Projects Controller", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  beforeEach(async () => {
    // Limpiar datos de prueba antes de cada test
    await DatabaseHelper.cleanTestDB();
    await DatabaseHelper.setupTestDB();
  });

  describe("POST /api/projects", () => {
    it("should create a new project", async () => {
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
      };

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(projectData.title);
      expect(response.body.data.description).toBe(projectData.description);
      expect(response.body.data.user_id).toBe(1);
    });

    it("should fail without authentication", async () => {
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
      };

      const response = await request(app)
        .post("/api/projects")
        .send(projectData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Authorization header missing");
    });

    it("should fail without title", async () => {
      const projectData = {
        description: "This is a test project",
      };

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Title is required");
    });
  });

  describe("GET /api/projects", () => {
    it("should return user projects", async () => {
      // Crear un proyecto primero
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
      };

      await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData);

      const response = await request(app)
        .get("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
      expect(response.body.data[0].title).toBe(projectData.title);
    });

    it("should return empty array for user with no projects", async () => {
      const response = await request(app)
        .get("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(0);
    });
  });
});
