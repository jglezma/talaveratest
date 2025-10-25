import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export class AuthController {
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password, name } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters long",
        });
        return;
      }

      console.log(
        `🎯 AuthController: POST /api/auth/register|signup - ${email}`
      );

      // Hashear la contraseña
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Generar JWT token
      const JWT_SECRET =
        process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production";
      const token = jwt.sign(
        {
          id: 1, // En producción, usar el ID real del usuario creado en DB
          email: email,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Por ahora respuesta de ejemplo (en producción, guardar en DB primero)
      res.status(201).json({
        success: true,
        data: {
          user: {
            id: 1,
            email,
            name: name || "Usuario",
          },
          token,
        },
        message: "User registered successfully",
      });

      console.log(`✅ User registered: ${email}`);
    } catch (error) {
      console.error("❌ Error in AuthController.register:", error);
      res.status(500).json({
        success: false,
        message: "Registration failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          success: false,
          message: "Email and password are required",
        });
        return;
      }

      console.log(`🎯 AuthController: POST /api/auth/login|signin - ${email}`);

      // En producción, verificar contraseña con bcrypt.compare()
      // const isValidPassword = await bcrypt.compare(password, user.password_hash);

      // Generar JWT token
      const JWT_SECRET =
        process.env.JWT_SECRET ||
        "your-super-secret-jwt-key-change-this-in-production";
      const token = jwt.sign(
        {
          id: 1, // En producción, usar el ID real del usuario de la DB
          email: email,
        },
        JWT_SECRET,
        { expiresIn: "7d" }
      );

      // Por ahora respuesta de ejemplo
      res.status(200).json({
        success: true,
        data: {
          user: {
            id: 1,
            email,
            name: "Usuario de Prueba",
          },
          token,
        },
        message: "Login successful",
      });

      console.log(`✅ User logged in: ${email}`);
    } catch (error) {
      console.error("❌ Error in AuthController.login:", error);
      res.status(500).json({
        success: false,
        message: "Login failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const userEmail = req.user?.email;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(`🎯 AuthController: GET /api/auth/profile - User ${userId}`);

      res.status(200).json({
        success: true,
        data: {
          id: userId,
          email: userEmail,
          name: "Usuario de Prueba",
        },
        message: "Profile retrieved successfully",
      });
    } catch (error) {
      console.error("❌ Error in AuthController.getProfile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to retrieve profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async updateProfile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { name, email } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(`🎯 AuthController: PUT /api/auth/profile - User ${userId}`);

      // Por ahora respuesta de ejemplo
      res.status(200).json({
        success: true,
        data: {
          id: userId,
          email: email || req.user?.email,
          name: name || "Usuario Actualizado",
        },
        message: "Profile updated successfully",
      });
    } catch (error) {
      console.error("❌ Error in AuthController.updateProfile:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update profile",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      console.log(`🎯 AuthController: POST /api/auth/logout - User ${userId}`);

      // En el frontend, simplemente eliminar el token del localStorage
      res.status(200).json({
        success: true,
        message: "Logout successful",
      });

      console.log(`✅ User logged out: ${userId}`);
    } catch (error) {
      console.error("❌ Error in AuthController.logout:", error);
      res.status(500).json({
        success: false,
        message: "Logout failed",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
