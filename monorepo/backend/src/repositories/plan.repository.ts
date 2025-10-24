import { query } from "../database/connection";
import { Plan } from "../types";

export class PlanRepository {
  async findAll(): Promise<Plan[]> {
    const result = await query(
      "SELECT * FROM plans WHERE is_active = true ORDER BY price ASC"
    );
    return result.rows;
  }

  async findById(id: number): Promise<Plan | null> {
    const result = await query("SELECT * FROM plans WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async findActiveById(id: number): Promise<Plan | null> {
    const result = await query(
      "SELECT * FROM plans WHERE id = $1 AND is_active = true",
      [id]
    );
    return result.rows[0] || null;
  }
}
