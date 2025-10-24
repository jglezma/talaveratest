import { Router } from "express";
import { ProjectsController } from "../controllers/projects.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const projectsController = new ProjectsController();

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get("/", projectsController.getProjects);
router.get("/:id", projectsController.getProject);
router.post("/", projectsController.createProject);
router.put("/:id", projectsController.updateProject);
router.delete("/:id", projectsController.deleteProject);

export default router;
