import { ProjectRepository } from "../repositories/project.repository";
import { Project } from "../types";

export class ProjectsService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async createProject(
    userId: number,
    data: {
      title: string;
      description?: string;
      status?: string;
    }
  ): Promise<Project> {
    try {
      console.log(`📁 ProjectsService: Creating project for user ${userId}`);

      if (!data.title || data.title.trim().length === 0) {
        throw new Error("Project title is required");
      }

      const project = await this.projectRepository.create({
        user_id: userId,
        title: data.title.trim(),
        description: data.description?.trim() || "",
        status: data.status || "active",
      });

      console.log("✅ Project created successfully");
      return project;
    } catch (error) {
      console.error("❌ Error in ProjectsService.createProject:", error);
      throw error;
    }
  }

  async getProjects(userId: number): Promise<Project[]> {
    try {
      console.log(`📁 ProjectsService: Getting projects for user ${userId}`);
      return await this.projectRepository.findByUserId(userId);
    } catch (error) {
      console.error("❌ Error in ProjectsService.getProjects:", error);
      throw error;
    }
  }

  async getProject(id: number, userId: number): Promise<Project | null> {
    try {
      console.log(
        `📁 ProjectsService: Getting project ${id} for user ${userId}`
      );
      return await this.projectRepository.findById(id, userId);
    } catch (error) {
      console.error("❌ Error in ProjectsService.getProject:", error);
      throw error;
    }
  }

  async updateProject(
    id: number,
    userId: number,
    updates: {
      title?: string;
      description?: string;
      status?: string;
    }
  ): Promise<Project> {
    try {
      console.log(
        `📁 ProjectsService: Updating project ${id} for user ${userId}`
      );

      if (updates.title !== undefined && updates.title.trim().length === 0) {
        throw new Error("Project title cannot be empty");
      }

      const cleanUpdates = {
        ...updates,
        title: updates.title?.trim(),
        description: updates.description?.trim(),
      };

      return await this.projectRepository.update(id, userId, cleanUpdates);
    } catch (error) {
      console.error("❌ Error in ProjectsService.updateProject:", error);
      throw error;
    }
  }

  async deleteProject(id: number, userId: number): Promise<boolean> {
    try {
      console.log(
        `📁 ProjectsService: Deleting project ${id} for user ${userId}`
      );
      return await this.projectRepository.delete(id, userId);
    } catch (error) {
      console.error("❌ Error in ProjectsService.deleteProject:", error);
      throw error;
    }
  }
}
