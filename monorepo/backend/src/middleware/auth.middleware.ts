import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../types";

export const authMiddleware = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void => {
  try {
    console.log("🔐 Auth middleware: Checking authentication...");

    const authHeader = req.headers.authorization;

    if (!authHeader) {
      console.log("❌ Auth middleware: No authorization header");
      res.status(401).json({
        success: false,
        message: "Authorization header missing",
      });
      return;
    }

    const token = authHeader.split(" ")[1]; // Bearer TOKEN

    if (!token) {
      console.log("❌ Auth middleware: No token in header");
      res.status(401).json({
        success: false,
        message: "Token missing",
      });
      return;
    }

    const JWT_SECRET =
      process.env.JWT_SECRET ||
      "your-super-secret-jwt-key-change-this-in-production";
    const decoded = jwt.verify(token, JWT_SECRET) as any;

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    console.log(
      `✅ Auth middleware: User ${decoded.id} (${decoded.email}) authenticated`
    );
    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
