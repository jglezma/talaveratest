import { Response } from "express";
import { ProjectsService } from "../services/projects.service";
import { AuthRequest } from "../types";

export class ProjectsController {
  private projectsService: ProjectsService;

  constructor() {
    this.projectsService = new ProjectsService();
  }

  async getProjects(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(`🎯 ProjectsController: GET /api/projects - User ${userId}`);

      const projects = await this.projectsService.getProjects(userId);

      res.status(200).json({
        success: true,
        data: projects,
        message: "Projects retrieved successfully",
      });

      console.log(
        `✅ ProjectsController: Retrieved ${projects.length} projects`
      );
    } catch (error) {
      console.error("❌ Error in ProjectsController.getProjects:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve projects",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { title, description, status } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!title || title.trim().length === 0) {
        res.status(400).json({
          success: false,
          message: "Title is required",
        });
        return;
      }

      console.log(`🎯 ProjectsController: POST /api/projects - User ${userId}`);
      console.log(
        `📁 Project data: title="${title}", description="${description}"`
      );

      const project = await this.projectsService.createProject(userId, {
        title,
        description,
        status,
      });

      res.status(201).json({
        success: true,
        data: project,
        message: "Project created successfully",
      });

      console.log(
        `✅ ProjectsController: Project created with ID ${project.id}`
      );
    } catch (error) {
      console.error("❌ Error in ProjectsController.createProject:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const projectId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      console.log(
        `🎯 ProjectsController: GET /api/projects/${projectId} - User ${userId}`
      );

      const project = await this.projectsService.getProject(projectId, userId);

      if (!project) {
        res.status(404).json({
          success: false,
          message: "Project not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: project,
        message: "Project retrieved successfully",
      });
    } catch (error) {
      console.error("❌ Error in ProjectsController.getProject:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const projectId = parseInt(req.params.id);
      const { title, description, status } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      console.log(
        `🎯 ProjectsController: PUT /api/projects/${projectId} - User ${userId}`
      );

      const project = await this.projectsService.updateProject(
        projectId,
        userId,
        {
          title,
          description,
          status,
        }
      );

      res.status(200).json({
        success: true,
        data: project,
        message: "Project updated successfully",
      });

      console.log(`✅ ProjectsController: Project ${projectId} updated`);
    } catch (error) {
      console.error("❌ Error in ProjectsController.updateProject:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async deleteProject(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const projectId = parseInt(req.params.id);

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (isNaN(projectId)) {
        res.status(400).json({
          success: false,
          message: "Invalid project ID",
        });
        return;
      }

      console.log(
        `🎯 ProjectsController: DELETE /api/projects/${projectId} - User ${userId}`
      );

      await this.projectsService.deleteProject(projectId, userId);

      res.status(200).json({
        success: true,
        message: "Project deleted successfully",
      });

      console.log(`✅ ProjectsController: Project ${projectId} deleted`);
    } catch (error) {
      console.error("❌ Error in ProjectsController.deleteProject:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete project",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
