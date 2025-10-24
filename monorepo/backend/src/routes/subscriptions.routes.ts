import { Router } from "express";
import { SubscriptionsController } from "../controllers/subscriptions.controller";
import { authenticateToken } from "../middleware/auth.middleware";

const router = Router();
const subscriptionsController = new SubscriptionsController();

router.get("/plans", subscriptionsController.getPlans);
router.post("/", authenticateToken, subscriptionsController.createSubscription);
router.get(
  "/",
  authenticateToken,
  subscriptionsController.getUserSubscriptions
);

export default router;
