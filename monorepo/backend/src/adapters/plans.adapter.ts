import { Plan } from "../types";

export class PlansAdapter {
  // Mock adapter para simular integración con sistema de pagos
  static async processPayment(
    planId: number,
    userId: number,
    amount: number
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Simular procesamiento de pago
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simular 90% de éxito en pagos
        const success = Math.random() > 0.1;

        if (success) {
          resolve({
            success: true,
            transactionId: `txn_${Date.now()}_${Math.random()
              .toString(36)
              .substr(2, 9)}`,
          });
        } else {
          resolve({
            success: false,
            error: "Payment processing failed",
          });
        }
      }, 1000); // Simular delay de red
    });
  }

  static async cancelSubscription(
    userId: number,
    planId: number
  ): Promise<{ success: boolean; error?: string }> {
    // Mock cancelación de suscripción
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ success: true });
      }, 500);
    });
  }

  static formatPlanForAPI(plan: Plan): any {
    return {
      id: plan.id,
      name: plan.name,
      description: plan.description,
      price: plan.price,
      features: plan.features,
      billingPeriod: plan.billing_period,
      recommended: plan.name === "Pro", // Marcar plan Pro como recomendado
    };
  }
}
