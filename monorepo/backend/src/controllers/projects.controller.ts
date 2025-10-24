import { Response } from "express";
import { z } from "zod";
import { ProjectsService } from "../services/projects.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const createProjectSchema = z.object({
  title: z.string().min(1, "Title is required").max(255, "Title too long"),
  description: z.string().optional(),
});

const updateProjectSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(255, "Title too long")
    .optional(),
  description: z.string().optional(),
  status: z.enum(["active", "inactive", "completed"]).optional(),
});

export class ProjectsController {
  private projectsService: ProjectsService;

  constructor() {
    this.projectsService = new ProjectsService();
  }

  getProjects = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const projects = await this.projectsService.getUserProjects(
        req.user.userId
      );

      res.json({
        message: "Projects retrieved successfully",
        data: projects,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error ? error.message : "Failed to get projects",
      });
    }
  };

  getProject = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ error: "Invalid project ID" });
        return;
      }

      const project = await this.projectsService.getProjectById(
        projectId,
        req.user.userId
      );

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json({
        message: "Project retrieved successfully",
        data: project,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get project",
      });
    }
  };

  createProject = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const validatedData = createProjectSchema.parse(req.body);
      const project = await this.projectsService.createProject(
        req.user.userId,
        validatedData
      );

      res.status(201).json({
        message: "Project created successfully",
        data: project,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
        return;
      }

      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to create project",
      });
    }
  };

  updateProject = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ error: "Invalid project ID" });
        return;
      }

      const validatedData = updateProjectSchema.parse(req.body);
      const project = await this.projectsService.updateProject(
        projectId,
        req.user.userId,
        validatedData
      );

      if (!project) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json({
        message: "Project updated successfully",
        data: project,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
        return;
      }

      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to update project",
      });
    }
  };

  deleteProject = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const projectId = parseInt(req.params.id);
      if (isNaN(projectId)) {
        res.status(400).json({ error: "Invalid project ID" });
        return;
      }

      const deleted = await this.projectsService.deleteProject(
        projectId,
        req.user.userId
      );

      if (!deleted) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      res.json({
        message: "Project deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        error:
          error instanceof Error ? error.message : "Failed to delete project",
      });
    }
  };
}
