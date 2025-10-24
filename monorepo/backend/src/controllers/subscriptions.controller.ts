import { Response } from "express";
import { z } from "zod";
import { SubscriptionsService } from "../services/subscriptions.service";
import { AuthenticatedRequest } from "../middleware/auth.middleware";

const createSubscriptionSchema = z.object({
  plan_id: z.number().int().positive("Plan ID must be a positive integer"),
});

export class SubscriptionsController {
  private subscriptionsService: SubscriptionsService;

  constructor() {
    this.subscriptionsService = new SubscriptionsService();
  }

  getPlans = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      const plans = await this.subscriptionsService.getPlans();

      res.json({
        message: "Plans retrieved successfully",
        data: plans,
      });
    } catch (error) {
      res.status(500).json({
        error: error instanceof Error ? error.message : "Failed to get plans",
      });
    }
  };

  createSubscription = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const validatedData = createSubscriptionSchema.parse(req.body);
      const subscription = await this.subscriptionsService.createSubscription(
        req.user.userId,
        validatedData
      );

      res.status(201).json({
        message: "Subscription created successfully",
        data: subscription,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation error",
          details: error.errors,
        });
        return;
      }

      res.status(400).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to create subscription",
      });
    }
  };

  getUserSubscriptions = async (
    req: AuthenticatedRequest,
    res: Response
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "User not authenticated" });
        return;
      }

      const subscriptions =
        await this.subscriptionsService.getUserSubscriptions(req.user.userId);

      res.json({
        message: "Subscriptions retrieved successfully",
        data: subscriptions,
      });
    } catch (error) {
      res.status(500).json({
        error:
          error instanceof Error
            ? error.message
            : "Failed to get subscriptions",
      });
    }
  };
}
