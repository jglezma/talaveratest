import { Router } from "express";
import { ProjectsController } from "../controllers/projects.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const projectsController = new ProjectsController();

console.log("📁 Projects routes initialized");

// Todas las rutas de proyectos requieren autenticación
router.use(authMiddleware);

// GET /api/projects - Obtener proyectos del usuario
router.get("/", (req, res) => {
  console.log("🛣️ Route: GET /api/projects");
  projectsController.getProjects(req, res);
});

// POST /api/projects - Crear proyecto
router.post("/", (req, res) => {
  console.log("🛣️ Route: POST /api/projects");
  projectsController.createProject(req, res);
});

// GET /api/projects/:id - Obtener proyecto específico
router.get("/:id", (req, res) => {
  console.log(`🛣️ Route: GET /api/projects/${req.params.id}`);
  projectsController.getProject(req, res);
});

// PUT /api/projects/:id - Actualizar proyecto
router.put("/:id", (req, res) => {
  console.log(`🛣️ Route: PUT /api/projects/${req.params.id}`);
  projectsController.updateProject(req, res);
});

// DELETE /api/projects/:id - Eliminar proyecto
router.delete("/:id", (req, res) => {
  console.log(`🛣️ Route: DELETE /api/projects/${req.params.id}`);
  projectsController.deleteProject(req, res);
});

export default router;
