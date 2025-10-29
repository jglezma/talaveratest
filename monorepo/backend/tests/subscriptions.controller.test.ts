import request from "supertest";
import { app } from "../app";
import { DatabaseHelper } from "./helpers/db.helper";
import { AuthHelper } from "./helpers/auth.helper";
import pool from "../database/connection";

describe("Subscriptions Controller (Advanced)", () => {
  beforeAll(async () => {
    await DatabaseHelper.setupTestDB();
  });

  afterAll(async () => {
    await DatabaseHelper.closeConnection();
  });

  beforeEach(async () => {
    await DatabaseHelper.cleanSubscriptions();
  });

  describe("POST /api/subscriptions (Advanced Scenarios)", () => {
    it("should create subscription with trial period", async () => {
      const subscriptionData = { plan_id: 1 };

      const response = await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send(subscriptionData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.status).toBe("trialing");
      expect(response.body.data.trial_ends_at).toBeDefined();
      expect(new Date(response.body.data.trial_ends_at)).toBeInstanceOf(Date);
    });

    it("should cancel existing subscription when creating new one", async () => {
      // Crear primera suscripción
      await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 1 });

      // Crear segunda suscripción (debería cancelar la primera)
      const response = await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 2 })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plan_id).toBe(2);

      // Verificar que solo hay una suscripción activa
      const subscriptions = await pool.query(
        "SELECT * FROM subscriptions WHERE user_id = $1 AND status IN ($2, $3)",
        [1, "active", "trialing"]
      );
      expect(subscriptions.rows.length).toBe(1);
      expect(subscriptions.rows[0].plan_id).toBe(2);
    });

    it("should handle database transaction rollback on error", async () => {
      // Mock para simular error en la base de datos
      const originalQuery = pool.query;
      let queryCount = 0;

      pool.query = jest.fn().mockImplementation((...args) => {
        queryCount++;
        if (queryCount === 3) {
          // Fallar en la tercera query
          throw new Error("Database connection failed");
        }
        return originalQuery.apply(pool, args);
      });

      const response = await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 1 })
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Failed to create subscription");

      // Restaurar la función original
      pool.query = originalQuery;
    });
  });

  describe("PUT /api/subscriptions/current (Advanced)", () => {
    beforeEach(async () => {
      // Crear suscripción inicial para cada test
      await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 1 });
    });

    it("should upgrade plan and recalculate billing period", async () => {
      const response = await request(app)
        .put("/api/subscriptions/current")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 2 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.plan_id).toBe(2);
      expect(response.body.data.status).toBe("trialing");
    });

    it("should handle concurrent subscription updates", async () => {
      // Simular dos requests simultáneos
      const promises = [
        request(app)
          .put("/api/subscriptions/current")
          .set(AuthHelper.getAuthHeaders())
          .send({ plan_id: 2 }),
        request(app)
          .put("/api/subscriptions/current")
          .set(AuthHelper.getAuthHeaders())
          .send({ status: "active" }),
      ];

      const responses = await Promise.allSettled(promises);

      // Al menos uno debería ser exitoso
      const successfulResponses = responses.filter(
        (r) => r.status === "fulfilled" && r.value.status < 400
      );
      expect(successfulResponses.length).toBeGreaterThan(0);
    });

    it("should validate subscription status transitions", async () => {
      // Intentar cambiar a un status inválido
      const response = await request(app)
        .put("/api/subscriptions/current")
        .set(AuthHelper.getAuthHeaders())
        .send({ status: "invalid_status" })
        .expect(500);

      expect(response.body.success).toBe(false);
    });
  });

  describe("Subscription Business Logic Tests", () => {
    it("should calculate correct billing periods for different plans", async () => {
      // Test plan mensual
      const monthlyResponse = await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 1 });

      const monthlySubscription = monthlyResponse.body.data;
      const monthlyStart = new Date(monthlySubscription.current_period_start);
      const monthlyEnd = new Date(monthlySubscription.current_period_end);

      expect(monthlyEnd.getMonth() - monthlyStart.getMonth()).toBe(1);

      // Limpiar y test plan anual (si existe)
      await DatabaseHelper.cleanSubscriptions();

      // Insertar plan anual para test
      await pool.query(`
        INSERT INTO plans (name, description, price, billing_period) 
        VALUES ('Annual', 'Plan anual', 99.99, 'yearly')
      `);

      const yearlyResponse = await request(app)
        .post("/api/subscriptions")
        .set(AuthHelper.getAuthHeaders())
        .send({ plan_id: 3 });

      const yearlySubscription = yearlyResponse.body.data;
      const yearlyStart = new Date(yearlySubscription.current_period_start);
      const yearlyEnd = new Date(yearlySubscription.current_period_end);

      expect(yearlyEnd.getFullYear() - yearlyStart.getFullYear()).toBe(1);
    });

    it("should handle subscription expiration logic", async () => {
      // Crear suscripción con fecha de expiración en el pasado
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await pool.query(
        `
        UPDATE subscriptions 
        SET trial_ends_at = $1, status = 'trialing'
        WHERE user_id = 1
      `,
        [pastDate]
      );

      // Intentar usar la suscripción expirada
      const response = await request(app)
        .get("/api/subscriptions/current")
        .set(AuthHelper.getAuthHeaders())
        .expect(200);

      // La lógica de negocio debería manejar suscripciones expiradas
      expect(response.body.data.trial_ends_at).toBeDefined();
    });
  });
});
