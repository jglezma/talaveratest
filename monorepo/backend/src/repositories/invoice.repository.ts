import { query } from "../database/connection";
import { Invoice, CreateSubscriptionRequest } from "../types";

export class InvoiceRepository {
  async findByUserId(userId: number): Promise<Invoice[]> {
    const result = await query(
      `SELECT i.*, p.name as plan_name 
       FROM invoices i 
       JOIN plans p ON i.plan_id = p.id 
       WHERE i.user_id = $1 
       ORDER BY i.created_at DESC`,
      [userId]
    );
    return result.rows;
  }

  async findById(id: number): Promise<Invoice | null> {
    const result = await query("SELECT * FROM invoices WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async create(
    userId: number,
    subscriptionData: CreateSubscriptionRequest,
    amount: number
  ): Promise<Invoice> {
    const { plan_id } = subscriptionData;
    const today = new Date();
    const nextMonth = new Date(
      today.getFullYear(),
      today.getMonth() + 1,
      today.getDate()
    );

    const result = await query(
      `INSERT INTO invoices (user_id, plan_id, amount, billing_period_start, billing_period_end) 
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, plan_id, amount, today, nextMonth]
    );
    return result.rows[0];
  }

  async updateStatus(
    id: number,
    status: "pending" | "paid" | "failed" | "cancelled"
  ): Promise<Invoice | null> {
    const result = await query(
      "UPDATE invoices SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    return result.rows[0] || null;
  }
}
