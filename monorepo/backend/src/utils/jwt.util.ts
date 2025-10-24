import jwt from "jsonwebtoken";
import { AuthPayload } from "../types";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key";

export const generateToken = (payload: AuthPayload): string => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
};

export const verifyToken = (token: string): AuthPayload => {
  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
};
