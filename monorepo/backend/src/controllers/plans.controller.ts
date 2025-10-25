import { Request, Response } from "express";
import { PlansService } from "../services/plans.service";

export class PlansController {
  private plansService: PlansService;

  constructor() {
    this.plansService = new PlansService();
  }

  async getPlans(req: Request, res: Response): Promise<void> {
    try {
      console.log("🎯 PlansController: GET /api/plans");
      const plans = await this.plansService.getAllPlans();

      res.status(200).json({
        success: true,
        data: plans,
        message: "Plans retrieved successfully",
      });

      console.log(`✅ PlansController: Returned ${plans.length} plans`);
    } catch (error) {
      console.error("❌ Error in PlansController.getPlans:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async getPlanById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const planId = parseInt(id, 10);

      console.log(`🎯 PlansController: GET /api/plans/${planId}`);

      if (isNaN(planId)) {
        res.status(400).json({
          success: false,
          message: "Invalid plan ID",
        });
        return;
      }

      const plan = await this.plansService.getPlanById(planId);

      if (!plan) {
        res.status(404).json({
          success: false,
          message: "Plan not found",
        });
        return;
      }

      res.status(200).json({
        success: true,
        data: plan,
        message: "Plan retrieved successfully",
      });

      console.log(`✅ PlansController: Returned plan ${plan.name}`);
    } catch (error) {
      console.error("❌ Error in PlansController.getPlanById:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  async createPlan(req: Request, res: Response): Promise<void> {
    try {
      console.log("🎯 PlansController: POST /api/plans");
      const planData = req.body;

      // Validar datos básicos
      if (!planData.name || !planData.price) {
        res.status(400).json({
          success: false,
          message: "Name and price are required",
        });
        return;
      }

      const plan = await this.plansService.createPlan(planData);

      res.status(201).json({
        success: true,
        data: plan,
        message: "Plan created successfully",
      });

      console.log(`✅ PlansController: Created plan ${plan.name}`);
    } catch (error) {
      console.error("❌ Error in PlansController.createPlan:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }
}
