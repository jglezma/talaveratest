import { SubscriptionRepository } from "../repositories/subscription.repository";
import { PlanRepository } from "../repositories/plan.repository";
import { Subscription } from "../types";

export class SubscriptionsService {
  private subscriptionRepository: SubscriptionRepository;
  private planRepository: PlanRepository;

  constructor() {
    this.subscriptionRepository = new SubscriptionRepository();
    this.planRepository = new PlanRepository();
  }

  async subscribe(userId: number, planId: number): Promise<Subscription> {
    try {
      console.log(
        `📋 SubscriptionsService: Creating subscription for user ${userId} to plan ${planId}`
      );

      // Verificar que el plan existe
      const plan = await this.planRepository.findById(planId);
      if (!plan) {
        throw new Error("Plan not found");
      }

      // Cancelar suscripción activa si existe
      const existingSubscription =
        await this.subscriptionRepository.findByUserId(userId);
      if (existingSubscription) {
        console.log("📋 Cancelling existing subscription");
        await this.subscriptionRepository.updateStatus(
          existingSubscription.id,
          "cancelled"
        );
      }

      // Calcular fechas del período
      const currentPeriodStart = new Date();
      const currentPeriodEnd = new Date();

      if (plan.billing_period === "monthly") {
        currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      } else if (plan.billing_period === "yearly") {
        currentPeriodEnd.setFullYear(currentPeriodEnd.getFullYear() + 1);
      }

      // Crear nueva suscripción con trial de 7 días
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + 7);

      const subscription = await this.subscriptionRepository.create({
        user_id: userId,
        plan_id: planId,
        status: "trialing",
        trial_ends_at: trialEndsAt,
        current_period_start: currentPeriodStart,
        current_period_end: currentPeriodEnd,
      });

      console.log("✅ Subscription created successfully");
      return subscription;
    } catch (error) {
      console.error("❌ Error in SubscriptionsService.subscribe:", error);
      throw error;
    }
  }

  async getCurrentSubscription(userId: number): Promise<Subscription | null> {
    try {
      return await this.subscriptionRepository.findByUserId(userId);
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsService.getCurrentSubscription:",
        error
      );
      throw error;
    }
  }

  async getAllSubscriptions(userId: number): Promise<Subscription[]> {
    try {
      return await this.subscriptionRepository.findAllByUserId(userId);
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsService.getAllSubscriptions:",
        error
      );
      throw error;
    }
  }

  async cancelSubscription(userId: number): Promise<Subscription> {
    try {
      const subscription = await this.subscriptionRepository.findByUserId(
        userId
      );
      if (!subscription) {
        throw new Error("No active subscription found");
      }

      return await this.subscriptionRepository.updateStatus(
        subscription.id,
        "cancelled"
      );
    } catch (error) {
      console.error(
        "❌ Error in SubscriptionsService.cancelSubscription:",
        error
      );
      throw error;
    }
  }
}
