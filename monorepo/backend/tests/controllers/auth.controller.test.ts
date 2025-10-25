import request from "supertest";
import { app } from "../../app";
import { DatabaseHelper } from "../helpers/db.helper";

describe("Auth Controller", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  describe("POST /api/auth/signup", () => {
    it("should register a new user", async () => {
      const userData = {
        email: "newuser@example.com",
        password: "password123",
        name: "New User",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.user.name).toBe(userData.name);
      expect(response.body.data.token).toBeDefined();
    });

    it("should fail with invalid email", async () => {
      const userData = {
        password: "password123",
        name: "New User",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Email and password are required");
    });

    it("should fail with short password", async () => {
      const userData = {
        email: "test@example.com",
        password: "123",
        name: "Test User",
      };

      const response = await request(app)
        .post("/api/auth/signup")
        .send(userData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe(
        "Password must be at least 6 characters long"
      );
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login existing user", async () => {
      const userData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(userData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.email).toBe(userData.email);
      expect(response.body.data.token).toBeDefined();
    });
  });
});
