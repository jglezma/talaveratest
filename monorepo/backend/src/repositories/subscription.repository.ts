import pool from "../database/connection";
import { Subscription } from "../types";

export class SubscriptionRepository {
  async create(subscription: {
    user_id: number;
    plan_id: number;
    status?: string;
    trial_ends_at?: Date;
    current_period_start?: Date;
    current_period_end: Date;
  }): Promise<Subscription> {
    const query = `
      INSERT INTO subscriptions (user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING id, user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end, created_at, updated_at
    `;

    try {
      console.log("📋 Creating subscription with data:", subscription);
      const result = await pool.query(query, [
        subscription.user_id,
        subscription.plan_id,
        subscription.status || "active",
        subscription.trial_ends_at,
        subscription.current_period_start || new Date(),
        subscription.current_period_end,
      ]);

      console.log("✅ Subscription created:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error creating subscription:", error);
      throw new Error("Failed to create subscription");
    }
  }

  async findByUserId(userId: number): Promise<Subscription | null> {
    const query = `
      SELECT s.*, p.name as plan_name, p.price as plan_price, p.billing_period
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1 AND s.status IN ('active', 'trialing')
      ORDER BY s.created_at DESC
      LIMIT 1
    `;

    try {
      console.log(`📋 Finding subscription for user ${userId}`);
      const result = await pool.query(query, [userId]);
      const subscription = result.rows[0] || null;
      console.log("📋 Found subscription:", subscription);
      return subscription;
    } catch (error) {
      console.error("❌ Error fetching subscription:", error);
      throw new Error("Failed to fetch subscription");
    }
  }

  async findAllByUserId(userId: number): Promise<Subscription[]> {
    const query = `
      SELECT s.*, p.name as plan_name, p.price as plan_price, p.billing_period
      FROM subscriptions s
      LEFT JOIN plans p ON s.plan_id = p.id
      WHERE s.user_id = $1
      ORDER BY s.created_at DESC
    `;

    try {
      console.log(`📋 Finding all subscriptions for user ${userId}`);
      const result = await pool.query(query, [userId]);
      console.log(`📋 Found ${result.rows.length} subscriptions`);
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching subscriptions:", error);
      throw new Error("Failed to fetch subscriptions");
    }
  }

  async updateStatus(id: number, status: string): Promise<Subscription> {
    const query = `
      UPDATE subscriptions 
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, user_id, plan_id, status, trial_ends_at, current_period_start, current_period_end, created_at, updated_at
    `;

    try {
      console.log(`📋 Updating subscription ${id} status to ${status}`);
      const result = await pool.query(query, [status, id]);

      if (result.rows.length === 0) {
        throw new Error("Subscription not found");
      }

      console.log("✅ Subscription updated:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error updating subscription:", error);
      throw new Error("Failed to update subscription");
    }
  }
}
