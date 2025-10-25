import { Router } from "express";
import { SubscriptionsController } from "../controllers/subscriptions.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();
const subscriptionsController = new SubscriptionsController();

console.log("💳 Subscriptions routes initialized");

// POST /api/subscriptions - Crear suscripción (requiere autenticación)
router.post("/", authMiddleware, (req, res) => {
  console.log("🛣️ Route: POST /api/subscriptions");
  subscriptionsController.subscribe(req, res);
});

// GET /api/subscriptions/current - Obtener suscripción activa (requiere autenticación)
router.get("/current", authMiddleware, (req, res) => {
  console.log("🛣️ Route: GET /api/subscriptions/current");
  subscriptionsController.getCurrentSubscription(req, res);
});

// GET /api/subscriptions - Obtener todas las suscripciones (requiere autenticación)
router.get("/", authMiddleware, (req, res) => {
  console.log("🛣️ Route: GET /api/subscriptions");
  subscriptionsController.getAllSubscriptions(req, res);
});

// POST /api/subscriptions/current/cancel - Cancelar suscripción (requiere autenticación)
router.post("/current/cancel", authMiddleware, (req, res) => {
  console.log("🛣️ Route: POST /api/subscriptions/current/cancel");
  subscriptionsController.cancelSubscription(req, res);
});

export default router;
