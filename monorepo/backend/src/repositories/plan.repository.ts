import pool from "../database/connection";
import { Plan } from "../types";

export class PlanRepository {
  async findAll(): Promise<Plan[]> {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        CAST(price as DECIMAL) as price,
        features, 
        billing_period, 
        is_active, 
        created_at, 
        updated_at
      FROM plans 
      WHERE is_active = true 
      ORDER BY price ASC
    `;

    try {
      console.log("🔍 Fetching all plans from database...");
      const result = await pool.query(query);

      // Asegurar que price es un número y features es un array
      const plans = result.rows.map((row) => ({
        ...row,
        price: parseFloat(row.price),
        features: Array.isArray(row.features)
          ? row.features
          : JSON.parse(row.features || "[]"),
      }));

      console.log(`✅ Found ${plans.length} plans`);
      console.log("📋 Plans data:", plans);
      return plans;
    } catch (error) {
      console.error("❌ Error fetching plans:", error);
      throw new Error("Failed to fetch plans");
    }
  }

  async findById(id: number): Promise<Plan | null> {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        CAST(price as DECIMAL) as price,
        features, 
        billing_period, 
        is_active, 
        created_at, 
        updated_at
      FROM plans 
      WHERE id = $1 AND is_active = true
    `;

    try {
      console.log(`🔍 Fetching plan with ID: ${id}`);
      const result = await pool.query(query, [id]);

      if (result.rows.length === 0) {
        console.log(`❌ Plan not found with ID: ${id}`);
        return null;
      }

      const plan = {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price),
        features: Array.isArray(result.rows[0].features)
          ? result.rows[0].features
          : JSON.parse(result.rows[0].features || "[]"),
      };

      console.log(`✅ Plan found: ${plan.name}`);
      return plan;
    } catch (error) {
      console.error("❌ Error fetching plan by id:", error);
      throw new Error("Failed to fetch plan");
    }
  }

  async create(
    plan: Omit<Plan, "id" | "created_at" | "updated_at">
  ): Promise<Plan> {
    const query = `
      INSERT INTO plans (name, description, price, features, billing_period, is_active)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING 
        id, 
        name, 
        description, 
        CAST(price as DECIMAL) as price,
        features, 
        billing_period, 
        is_active, 
        created_at, 
        updated_at
    `;

    try {
      console.log(`🔄 Creating plan: ${plan.name}`);
      const result = await pool.query(query, [
        plan.name,
        plan.description,
        plan.price,
        JSON.stringify(plan.features),
        plan.billing_period,
        plan.is_active,
      ]);

      const createdPlan = {
        ...result.rows[0],
        price: parseFloat(result.rows[0].price),
        features: Array.isArray(result.rows[0].features)
          ? result.rows[0].features
          : JSON.parse(result.rows[0].features || "[]"),
      };

      console.log(`✅ Plan created: ${createdPlan.name}`);
      return createdPlan;
    } catch (error) {
      console.error("❌ Error creating plan:", error);
      throw new Error("Failed to create plan");
    }
  }
}
