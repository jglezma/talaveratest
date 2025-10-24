import { ProjectRepository } from "../repositories/project.repository";
import { Project, CreateProjectRequest, UpdateProjectRequest } from "../types";

export class ProjectsService {
  private projectRepository: ProjectRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
  }

  async getUserProjects(userId: number): Promise<Project[]> {
    return this.projectRepository.findByUserId(userId);
  }

  async getProjectById(id: number, userId: number): Promise<Project | null> {
    return this.projectRepository.findByIdAndUserId(id, userId);
  }

  async createProject(
    userId: number,
    projectData: CreateProjectRequest
  ): Promise<Project> {
    if (!projectData.title || projectData.title.trim().length === 0) {
      throw new Error("Project title is required");
    }

    return this.projectRepository.create(userId, {
      title: projectData.title.trim(),
      description: projectData.description?.trim() || "",
    });
  }

  async updateProject(
    id: number,
    userId: number,
    projectData: UpdateProjectRequest
  ): Promise<Project | null> {
    const existingProject = await this.projectRepository.findByIdAndUserId(
      id,
      userId
    );
    if (!existingProject) {
      throw new Error("Project not found");
    }

    // Validar datos de actualización
    const updateData: UpdateProjectRequest = {};

    if (projectData.title !== undefined) {
      if (projectData.title.trim().length === 0) {
        throw new Error("Project title cannot be empty");
      }
      updateData.title = projectData.title.trim();
    }

    if (projectData.description !== undefined) {
      updateData.description = projectData.description.trim();
    }

    if (projectData.status !== undefined) {
      if (!["active", "inactive", "completed"].includes(projectData.status)) {
        throw new Error("Invalid project status");
      }
      updateData.status = projectData.status;
    }

    return this.projectRepository.update(id, userId, updateData);
  }

  async deleteProject(id: number, userId: number): Promise<boolean> {
    const existingProject = await this.projectRepository.findByIdAndUserId(
      id,
      userId
    );
    if (!existingProject) {
      throw new Error("Project not found");
    }

    return this.projectRepository.delete(id, userId);
  }
}
