import { PlanRepository } from "../repositories/plan.repository";
import { InvoiceRepository } from "../repositories/invoice.repository";
import { Plan, Invoice, CreateSubscriptionRequest } from "../types";
import { PlansAdapter } from "../adapters/plans.adapter";

export class SubscriptionsService {
  private planRepository: PlanRepository;
  private invoiceRepository: InvoiceRepository;

  constructor() {
    this.planRepository = new PlanRepository();
    this.invoiceRepository = new InvoiceRepository();
  }

  async getPlans(): Promise<any[]> {
    const plans = await this.planRepository.findAll();
    return plans.map((plan) => PlansAdapter.formatPlanForAPI(plan));
  }

  async createSubscription(
    userId: number,
    subscriptionData: CreateSubscriptionRequest
  ): Promise<Invoice> {
    const { plan_id } = subscriptionData;

    // Verificar que el plan existe y está activo
    const plan = await this.planRepository.findActiveById(plan_id);
    if (!plan) {
      throw new Error("Plan not found or inactive");
    }

    // Crear la factura
    const invoice = await this.invoiceRepository.create(
      userId,
      subscriptionData,
      plan.price
    );

    // Simular procesamiento de pago
    try {
      const paymentResult = await PlansAdapter.processPayment(
        plan_id,
        userId,
        plan.price
      );

      if (paymentResult.success) {
        // Actualizar estado a pagado
        const updatedInvoice = await this.invoiceRepository.updateStatus(
          invoice.id,
          "paid"
        );
        return updatedInvoice || invoice;
      } else {
        // Actualizar estado a fallido
        await this.invoiceRepository.updateStatus(invoice.id, "failed");
        throw new Error(paymentResult.error || "Payment processing failed");
      }
    } catch (error) {
      // En caso de error, marcar como fallido
      await this.invoiceRepository.updateStatus(invoice.id, "failed");
      throw error;
    }
  }

  async getUserSubscriptions(userId: number): Promise<Invoice[]> {
    return this.invoiceRepository.findByUserId(userId);
  }

  async cancelSubscription(
    userId: number,
    planId: number
  ): Promise<{ success: boolean }> {
    // Mock cancelación usando el adapter
    const result = await PlansAdapter.cancelSubscription(userId, planId);
    return result;
  }
}
