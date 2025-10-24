import { Request, Response } from "express";
import { z } from "zod";
import { AuthService } from "../services/auth.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const signupSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  name: z.string().min(1, "Name is required"),
});

const signinSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  signup = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = signupSchema.parse(req.body);
      const result = await this.authService.signup(validatedData);

      res.status(201).json({
        message: "User created successfully",
        data: result,
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
        error: error instanceof Error ? error.message : "Failed to create user",
      });
    }
  };

  signin = async (req: Request, res: Response): Promise<void> => {
    try {
      const validatedData = signinSchema.parse(req.body);
      const result = await this.authService.signin(validatedData);

      res.json({
        message: "Sign in successful",
        data: result,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
        return;
      }

      res.status(401).json({
        error: error instanceof Error ? error.message : "Sign in failed",
      });
    }
  };

  getProfile = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const user = await this.authService.getProfile(req.user.userId);

      if (!user) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      res.json({
        message: "Profile retrieved successfully",
        data: user,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get profile",
      });
    }
  };
}
