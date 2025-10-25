import jwt from "jsonwebtoken";
export class AuthHelper {
  static generateTestToken(
    userId: number = 1,
    email: string = "test@example.com"
  ): string {
    const JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
    return jwt.sign({ id: userId, email }, JWT_SECRET, { expiresIn: "1h" });
  }
  static getAuthHeaders(token?: string): { Authorization: string } {
    const testToken = token || this.generateTestToken();
    return { Authorization: `Bearer ${testToken}` };
  }
}
