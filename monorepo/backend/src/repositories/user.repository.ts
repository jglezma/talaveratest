import { query } from "../database/connection";
import { User, CreateUserRequest } from "../types";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE email = $1", [email]);
    return result.rows[0] || null;
  }

  async findById(id: number): Promise<User | null> {
    const result = await query("SELECT * FROM users WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async create(userData: CreateUserRequest): Promise<User> {
    const { email, password, name } = userData;
    const result = await query(
      "INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING *",
      [email, password, name]
    );
    return result.rows[0];
  }

  async update(id: number, userData: Partial<User>): Promise<User | null> {
    const fields = Object.keys(userData);
    const values = Object.values(userData);

    if (fields.length === 0) {
      return this.findById(id);
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 2}`)
      .join(", ");
    const result = await query(
      `UPDATE users SET ${setClause} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );

    return result.rows[0] || null;
  }

  async delete(id: number): Promise<boolean> {
    const result = await query("DELETE FROM users WHERE id = $1", [id]);
    return result.rowCount > 0;
  }
}
