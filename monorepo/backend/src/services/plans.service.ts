import { PlanRepository } from "../repositories/plan.repository";
import { Plan } from "../types";

export class PlansService {
  private planRepository: PlanRepository;

  constructor() {
    this.planRepository = new PlanRepository();
  }

  async getAllPlans(): Promise<Plan[]> {
    try {
      console.log("📋 PlansService: Getting all plans...");
      const plans = await this.planRepository.findAll();
      console.log(`📋 PlansService: Retrieved ${plans.length} plans`);
      return plans;
    } catch (error) {
      console.error("❌ Error in PlansService.getAllPlans:", error);
      throw new Error("Failed to retrieve plans");
    }
  }

  async getPlanById(id: number): Promise<Plan | null> {
    try {
      console.log(`📋 PlansService: Getting plan with ID ${id}...`);
      const plan = await this.planRepository.findById(id);
      return plan;
    } catch (error) {
      console.error("❌ Error in PlansService.getPlanById:", error);
      throw new Error("Failed to retrieve plan");
    }
  }

  async createPlan(
    planData: Omit<Plan, "id" | "created_at" | "updated_at">
  ): Promise<Plan> {
    try {
      console.log(`📋 PlansService: Creating plan ${planData.name}...`);
      const plan = await this.planRepository.create(planData);
      return plan;
    } catch (error) {
      console.error("❌ Error in PlansService.createPlan:", error);
      throw new Error("Failed to create plan");
    }
  }
}
