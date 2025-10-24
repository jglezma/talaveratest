import { query } from "../database/connection";
import { Project, CreateProjectRequest, UpdateProjectRequest } from "../types";

export class ProjectRepository {
  async findByUserId(userId: number): Promise<Project[]> {
    const result = await query(
      "SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC",
      [userId]
    );
    return result.rows;
  }

  async findById(id: number): Promise<Project | null> {
    const result = await query("SELECT * FROM projects WHERE id = $1", [id]);
    return result.rows[0] || null;
  }

  async findByIdAndUserId(id: number, userId: number): Promise<Project | null> {
    const result = await query(
      "SELECT * FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rows[0] || null;
  }

  async create(
    userId: number,
    projectData: CreateProjectRequest
  ): Promise<Project> {
    const { title, description } = projectData;
    const result = await query(
      "INSERT INTO projects (user_id, title, description) VALUES ($1, $2, $3) RETURNING *",
      [userId, title, description]
    );
    return result.rows[0];
  }

  async update(
    id: number,
    userId: number,
    projectData: UpdateProjectRequest
  ): Promise<Project | null> {
    const fields = Object.keys(projectData);
    const values = Object.values(projectData);

    if (fields.length === 0) {
      return this.findByIdAndUserId(id, userId);
    }

    const setClause = fields
      .map((field, index) => `${field} = $${index + 3}`)
      .join(", ");
    const result = await query(
      `UPDATE projects SET ${setClause} WHERE id = $1 AND user_id = $2 RETURNING *`,
      [id, userId, ...values]
    );

    return result.rows[0] || null;
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const result = await query(
      "DELETE FROM projects WHERE id = $1 AND user_id = $2",
      [id, userId]
    );
    return result.rowCount > 0;
  }
}
