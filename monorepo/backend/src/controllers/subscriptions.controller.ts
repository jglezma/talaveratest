import { Response } from "express";
import { SubscriptionsService } from "../services/subscriptions.service";
import { AuthRequest } from "../types";

export class SubscriptionsController {
  private subscriptionsService: SubscriptionsService;

  constructor() {
    this.subscriptionsService = new SubscriptionsService();
  }

  async updateCurrentSubscription(
    req: AuthRequest,
    res: Response
  ): Promise<void> {
    try {
      console.log(
        "🎯 SubscriptionsController: PUT /api/subscriptions/current - START"
      );
      console.log("📋 Request body:", req.body);
      console.log("📋 Request user:", req.user);

      const userId = req.user?.id;
      const { plan_id, status } = req.body;

      if (!userId) {
        console.log("❌ User not authenticated");
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(
        `🎯 SubscriptionsController: PUT /api/subscriptions/current - User ${userId}`
      );
      console.log(`📋 Update data: plan_id=${plan_id}, status=${status}`);

      // Si se proporciona un nuevo plan_id, cambiar de plan
      if (plan_id) {
        console.log(`📋 Changing plan to ${plan_id}`);
        const subscription = await this.subscriptionsService.changePlan(
          userId,
          plan_id
        );
        res.status(200).json({
          success: true,
          data: subscription,
          message: "Subscription plan updated successfully",
        });
        return;
      }

      // Si se proporciona un status, actualizar estado
      if (status) {
        console.log(`📋 Updating status to ${status}`);
        const subscription = await this.subscriptionsService.updateStatus(
          userId,
          status
        );
        res.status(200).json({
          success: true,
          data: subscription,
          message: "Subscription status updated successfully",
        });
        return;
      }

      console.log("❌ No update parameters provided");
      res.status(400).json({
        success: false,
        message: "No update parameters provided (plan_id or status required)",
      });
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsController.updateCurrentSubscription:",
        error
      );
      console.error(
        "❌ Error stack:",
        error instanceof Error ? error.stack : "No stack trace"
      );
      res.status(500).json({
        success: false,
        message: "Failed to update subscription",
        error: error instanceof Error ? error.message : "Unknown error",
        details: process.env.NODE_ENV === "development" ? error : undefined,
      });
    }
  }

  // ... resto de métodos existentes sin cambios ...
  async subscribe(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      const { plan_id } = req.body;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      if (!plan_id) {
        res.status(400).json({
          success: false,
          message: "Plan ID is required",
        });
        return;
      }

      console.log(
        `🎯 SubscriptionsController: POST /api/subscriptions - User ${userId} subscribing to plan ${plan_id}`
      );

      const subscription = await this.subscriptionsService.subscribe(
        userId,
        plan_id
      );

      res.status(201).json({
        success: true,
        data: subscription,
        message: "Subscription created successfully",
      });

      console.log(
        "✅ SubscriptionsController: Subscription created successfully"
      );
    } catch (error) {
      console.error("❌ Error in SubscriptionsController.subscribe:", error);
      res.status(500).json({
        success: false,
        message: "Failed to create subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getCurrentSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(
        `🎯 SubscriptionsController: GET /api/subscriptions/current - User ${userId}`
      );

      const subscription =
        await this.subscriptionsService.getCurrentSubscription(userId);

      if (!subscription) {
        res.status(404).json({
          success: false,
          message: "No active subscription found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription retrieved successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsController.getCurrentSubscription:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getAllSubscriptions(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(
        `🎯 SubscriptionsController: GET /api/subscriptions - User ${userId}`
      );

      const subscriptions = await this.subscriptionsService.getAllSubscriptions(
        userId
      );

      res.status(200).json({
        success: true,
        data: subscriptions,
        message: "Subscriptions retrieved successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsController.getAllSubscriptions:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to retrieve subscriptions",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async cancelSubscription(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;

      if (!userId) {
        res.status(401).json({
          success: false,
          message: "User not authenticated",
        });
        return;
      }

      console.log(
        `🎯 SubscriptionsController: POST /api/subscriptions/current/cancel - User ${userId}`
      );

      const subscription = await this.subscriptionsService.cancelSubscription(
        userId
      );

      res.status(200).json({
        success: true,
        data: subscription,
        message: "Subscription cancelled successfully",
      });
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsController.cancelSubscription:",
        error
      );
      res.status(500).json({
        success: false,
        message: "Failed to cancel subscription",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
