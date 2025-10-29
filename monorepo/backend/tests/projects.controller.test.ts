import request from "supertest";
import { app } from "../app";
import { DatabaseHelper } from "./helpers/db.helper";
import { AuthHelper } from "./helpers/auth.helper";

describe("Projects Controller", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  beforeEach(async () => {
    // Limpiar proyectos antes de cada test
    await DatabaseHelper.cleanProjects();
  });

  describe("POST /api/projects", () => {
    it("should create a new project successfully", async () => {
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
        status: "active",
      };

      const response = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(projectData.title);
      expect(response.body.data.description).toBe(projectData.description);
      expect(response.body.data.status).toBe(projectData.status);
      expect(response.body.data.user_id).toBe(1);
      expect(response.body.data.id).toBeDefined();
    });

    it("should create project with default status when not provided", async () => {
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
      expect(response.body.data.status).toBe("active");
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

    it("should fail with empty title", async () => {
      const projectData = {
        title: "   ",
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
      // Crear algunos proyectos primero
      const projects = [
        { title: "Project 1", description: "Description 1" },
        { title: "Project 2", description: "Description 2" },
      ];

      for (const project of projects) {
        await request(app)
          .post("/api/projects")
          .set(AuthHelper.getAuthHeaders())
          .send(project);
      }

      const response = await request(app)
        .get("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(2);
      expect(response.body.data[0].title).toBe("Project 2"); // Más reciente primero
      expect(response.body.data[1].title).toBe("Project 1");
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

    it("should fail without authentication", async () => {
      const response = await request(app).get("/api/projects").expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Authorization header missing");
    });
  });

  describe("GET /api/projects/:id", () => {
    it("should return specific project", async () => {
      // Crear un proyecto
      const projectData = {
        title: "Test Project",
        description: "This is a test project",
      };

      const createResponse = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData);

      const projectId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/projects/${projectId}`)
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(projectId);
      expect(response.body.data.title).toBe(projectData.title);
    });

    it("should return 404 for non-existent project", async () => {
      const response = await request(app)
        .get("/api/projects/999")
        .set(AuthHelper.getAuthHeaders())
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Project not found");
    });

    it("should fail with invalid project ID", async () => {
      const response = await request(app)
        .get("/api/projects/invalid")
        .set(AuthHelper.getAuthHeaders())
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Invalid project ID");
    });
  });

  describe("PUT /api/projects/:id", () => {
    it("should update project successfully", async () => {
      // Crear un proyecto
      const projectData = {
        title: "Original Title",
        description: "Original description",
      };

      const createResponse = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send(projectData);

      const projectId = createResponse.body.data.id;

      // Actualizar el proyecto
      const updateData = {
        title: "Updated Title",
        description: "Updated description",
        status: "completed",
      };

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set(AuthHelper.getAuthHeaders())
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(updateData.title);
      expect(response.body.data.description).toBe(updateData.description);
      expect(response.body.data.status).toBe(updateData.status);
    });

    it("should fail to update with empty title", async () => {
      // Crear un proyecto
      const createResponse = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send({ title: "Test", description: "Test" });

      const projectId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/projects/${projectId}`)
        .set(AuthHelper.getAuthHeaders())
        .send({ title: "   " })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe("DELETE /api/projects/:id", () => {
    it("should delete project successfully", async () => {
      // Crear un proyecto
      const createResponse = await request(app)
        .post("/api/projects")
        .set(AuthHelper.getAuthHeaders())
        .send({ title: "To Delete", description: "Will be deleted" });

      const projectId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/projects/${projectId}`)
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe("Project deleted successfully");

      // Verificar que ya no existe
      await request(app)
        .get(`/api/projects/${projectId}`)
        .set(AuthHelper.getAuthHeaders())
        .expect(404);
    });

    it("should return 404 for non-existent project", async () => {
      const response = await request(app)
        .delete("/api/projects/999")
        .set(AuthHelper.getAuthHeaders())
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });
});
