import { Router } from "express";
import { PlansController } from "../controllers/plans.controller";

const router = Router();
const plansController = new PlansController();

console.log("📋 Plans routes initialized");

// GET /api/plans - Obtener todos los planes (público)
router.get("/", (req, res) => {
  console.log("🛣️ Route: GET /api/plans");
  plansController.getPlans(req, res);
});

// GET /api/plans/:id - Obtener un plan por ID (público)
router.get("/:id", (req, res) => {
  console.log(`🛣️ Route: GET /api/plans/${req.params.id}`);
  plansController.getPlanById(req, res);
});

// POST /api/plans - Crear un nuevo plan (solo para admin - agregar middleware después)
router.post("/", (req, res) => {
  console.log("🛣️ Route: POST /api/plans");
  plansController.createPlan(req, res);
});

export default router;
