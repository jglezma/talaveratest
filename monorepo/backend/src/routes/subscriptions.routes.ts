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

// PUT /api/subscriptions/current - Actualizar suscripción activa (requiere autenticación)
router.put("/current", authMiddleware, (req, res) => {
  console.log("🛣️ Route: PUT /api/subscriptions/current");
  subscriptionsController.updateCurrentSubscription(req, res);
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

// DELETE /api/subscriptions/current - Alias para cancelar suscripción
router.delete("/current", authMiddleware, (req, res) => {
  console.log("🛣️ Route: DELETE /api/subscriptions/current (alias for cancel)");
  subscriptionsController.cancelSubscription(req, res);
});

// PUT /api/subscriptions/:id - Actualizar suscripción específica (requiere autenticación)
router.put("/:id", authMiddleware, (req, res) => {
  console.log(`🛣️ Route: PUT /api/subscriptions/${req.params.id}`);
  subscriptionsController.updateSubscription(req, res);
});

export default router;
