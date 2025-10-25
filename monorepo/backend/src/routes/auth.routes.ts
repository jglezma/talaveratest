import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const authController = new AuthController();

console.log("🔐 Auth routes initialized");

// POST /api/auth/register - Registro (público)
router.post("/register", (req, res) => {
  console.log("🛣️ Route: POST /api/auth/register");
  authController.register(req, res);
});

// POST /api/auth/signup - Alias para register (público)
router.post("/signup", (req, res) => {
  console.log("🛣️ Route: POST /api/auth/signup (alias for register)");
  authController.register(req, res);
});

// POST /api/auth/login - Login (público)
router.post("/login", (req, res) => {
  console.log("🛣️ Route: POST /api/auth/login");
  authController.login(req, res);
});

// POST /api/auth/signin - Alias para login (público)
router.post("/signin", (req, res) => {
  console.log("🛣️ Route: POST /api/auth/signin (alias for login)");
  authController.login(req, res);
});

// GET /api/auth/profile - Obtener perfil (requiere autenticación)
router.get("/profile", authMiddleware, (req, res) => {
  console.log("🛣️ Route: GET /api/auth/profile");
  authController.getProfile(req, res);
});

// PUT /api/auth/profile - Actualizar perfil (requiere autenticación)
router.put("/profile", authMiddleware, (req, res) => {
  console.log("🛣️ Route: PUT /api/auth/profile");
  authController.updateProfile(req, res);
});

// POST /api/auth/logout - Logout (requiere autenticación)
router.post("/logout", authMiddleware, (req, res) => {
  console.log("🛣️ Route: POST /api/auth/logout");
  authController.logout(req, res);
});

export default router;
