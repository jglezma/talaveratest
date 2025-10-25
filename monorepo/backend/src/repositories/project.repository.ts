import pool from "../database/connection";
import { Project } from "../types";

export class ProjectRepository {
  async create(project: {
    user_id: number;
    title: string;
    description?: string;
    status?: string;
  }): Promise<Project> {
    const query = `
      INSERT INTO projects (user_id, title, description, status)
      VALUES ($1, $2, $3, $4)
      RETURNING id, user_id, title, description, status, created_at, updated_at
    `;

    try {
      console.log("📁 Creating project with data:", project);
      const result = await pool.query(query, [
        project.user_id,
        project.title,
        project.description || "",
        project.status || "active",
      ]);

      console.log("✅ Project created:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error creating project:", error);
      throw new Error("Failed to create project");
    }
  }

  async findByUserId(userId: number): Promise<Project[]> {
    const query = `
      SELECT id, user_id, title, description, status, created_at, updated_at
      FROM projects
      WHERE user_id = $1
      ORDER BY created_at DESC
    `;

    try {
      console.log(`📁 Finding projects for user ${userId}`);
      const result = await pool.query(query, [userId]);
      console.log(`📁 Found ${result.rows.length} projects`);
      return result.rows;
    } catch (error) {
      console.error("❌ Error fetching projects:", error);
      throw new Error("Failed to fetch projects");
    }
  }

  async findById(id: number, userId: number): Promise<Project | null> {
    const query = `
      SELECT id, user_id, title, description, status, created_at, updated_at
      FROM projects
      WHERE id = $1 AND user_id = $2
    `;

    try {
      console.log(`📁 Finding project ${id} for user ${userId}`);
      const result = await pool.query(query, [id, userId]);
      const project = result.rows[0] || null;
      console.log("📁 Found project:", project);
      return project;
    } catch (error) {
      console.error("❌ Error fetching project:", error);
      throw new Error("Failed to fetch project");
    }
  }

  async update(
    id: number,
    userId: number,
    updates: {
      title?: string;
      description?: string;
      status?: string;
    }
  ): Promise<Project> {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (updates.title !== undefined) {
      fields.push(`title = $${paramCount++}`);
      values.push(updates.title);
    }
    if (updates.description !== undefined) {
      fields.push(`description = $${paramCount++}`);
      values.push(updates.description);
    }
    if (updates.status !== undefined) {
      fields.push(`status = $${paramCount++}`);
      values.push(updates.status);
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id, userId);

    const query = `
      UPDATE projects 
      SET ${fields.join(", ")}
      WHERE id = $${paramCount++} AND user_id = $${paramCount++}
      RETURNING id, user_id, title, description, status, created_at, updated_at
    `;

    try {
      console.log(`📁 Updating project ${id} for user ${userId}:`, updates);
      const result = await pool.query(query, values);

      if (result.rows.length === 0) {
        throw new Error("Project not found or access denied");
      }

      console.log("✅ Project updated:", result.rows[0]);
      return result.rows[0];
    } catch (error) {
      console.error("❌ Error updating project:", error);
      throw new Error("Failed to update project");
    }
  }

  async delete(id: number, userId: number): Promise<boolean> {
    const query = `
      DELETE FROM projects
      WHERE id = $1 AND user_id = $2
      RETURNING id
    `;

    try {
      console.log(`📁 Deleting project ${id} for user ${userId}`);
      const result = await pool.query(query, [id, userId]);

      if (result.rows.length === 0) {
        throw new Error("Project not found or access denied");
      }

      console.log("✅ Project deleted");
      return true;
    } catch (error) {
      console.error("❌ Error deleting project:", error);
      throw new Error("Failed to delete project");
    }
  }
}
