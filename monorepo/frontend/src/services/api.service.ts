import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import {
  User,
  Project,
  Plan,
  Invoice,
  Subscription,
  PaymentMethod,
  SubscriptionUsage,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  SubscriptionRequest,
  CancelSubscriptionRequest,
  UpdateSubscriptionRequest,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

console.log("🔧 API Service initialized with URL:", API_URL);

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("📤 API Request:", {
    method: config.method?.toUpperCase(),
    url: config.url,
    baseURL: config.baseURL,
    data: config.data,
    headers: config.headers,
  });

  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => {
    console.log("📥 API Response:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    console.error("❌ API Error:", {
      status: error.response?.status,
      url: error.config?.url,
      data: error.response?.data,
      message: error.message,
    });

    if (error.response?.status === 401) {
      console.log("🔒 Unauthorized - clearing auth and redirecting to login");
      useAuthStore.getState().logout();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export class ApiService {
  // Auth endpoints
  static async signup(data: RegisterRequest): Promise<AuthResponse> {
    console.log("🔄 Calling signup API...");
    const response = await api.post("/api/auth/signup", data);

    if (response.data && response.data.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.token,
      };
    }

    return response.data;
  }

  static async signin(data: LoginRequest): Promise<AuthResponse> {
    console.log("🔄 Calling signin API...");
    const response = await api.post("/api/auth/signin", data);

    if (response.data && response.data.data) {
      return {
        user: response.data.data.user,
        token: response.data.data.token,
      };
    }

    return response.data;
  }

  static async getProfile(): Promise<User> {
    console.log("🔄 Calling getProfile API...");
    const response = await api.get("/api/auth/profile");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  // Projects endpoints
  static async getProjects(): Promise<Project[]> {
    console.log("🔄 Calling getProjects API...");
    const response = await api.get("/api/projects");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async createProject(data: Partial<Project>): Promise<Project> {
    console.log("🔄 Calling createProject API...");
    const response = await api.post("/api/projects", data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async updateProject(
    id: number,
    data: Partial<Project>
  ): Promise<Project> {
    console.log(`🔄 Calling updateProject API for ID ${id}...`);
    const response = await api.put(`/api/projects/${id}`, data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async deleteProject(id: number): Promise<void> {
    console.log(`🔄 Calling deleteProject API for ID ${id}...`);
    await api.delete(`/api/projects/${id}`);
  }

  // Plans endpoints
  static async getPlans(): Promise<Plan[]> {
    try {
      console.log("📋 ApiService: Fetching plans...");
      const response = await api.get("/api/plans");

      if (response.data && response.data.data) {
        // Asegurar que cada plan tiene el formato correcto
        const plans = response.data.data.map((plan: any) => ({
          ...plan,
          price:
            typeof plan.price === "string"
              ? parseFloat(plan.price)
              : plan.price,
          features: Array.isArray(plan.features)
            ? plan.features
            : JSON.parse(plan.features || "[]"),
        }));

        console.log("✅ ApiService: Plans processed:", plans);
        return plans;
      }

      return response.data;
    } catch (error) {
      console.error("❌ ApiService: Error fetching plans:", error);
      throw error;
    }
  }

  static async getPlan(id: number): Promise<Plan> {
    try {
      console.log(`📋 ApiService: Fetching plan ${id}...`);
      const response = await api.get(`/api/plans/${id}`);

      if (response.data && response.data.data) {
        const plan = {
          ...response.data.data,
          price:
            typeof response.data.data.price === "string"
              ? parseFloat(response.data.data.price)
              : response.data.data.price,
          features: Array.isArray(response.data.data.features)
            ? response.data.data.features
            : JSON.parse(response.data.data.features || "[]"),
        };

        console.log("✅ ApiService: Plan processed:", plan);
        return plan;
      }

      return response.data;
    } catch (error) {
      console.error("❌ ApiService: Error fetching plan:", error);
      throw error;
    }
  }

  // Subscriptions endpoints
  static async subscribe(data: SubscriptionRequest): Promise<Subscription> {
    console.log("🔄 Calling subscribe API...", data);
    const response = await api.post("/api/subscriptions", data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async getSubscription(): Promise<Subscription | null> {
    console.log("🔄 Calling getSubscription API...");
    try {
      const response = await api.get("/api/subscriptions/current");

      if (response.data && response.data.data) {
        return response.data.data;
      }

      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null; // No active subscription
      }
      throw error;
    }
  }

  static async getSubscriptions(): Promise<Subscription[]> {
    console.log("🔄 Calling getSubscriptions API...");
    const response = await api.get("/api/subscriptions");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async updateSubscription(
    data: UpdateSubscriptionRequest
  ): Promise<Subscription> {
    console.log("🔄 Calling updateSubscription API...", data);
    const response = await api.put("/api/subscriptions/current", data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async cancelSubscription(
    data: CancelSubscriptionRequest
  ): Promise<Subscription> {
    console.log("🔄 Calling cancelSubscription API...", data);
    const response = await api.post("/api/subscriptions/current/cancel", data);

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async reactivateSubscription(): Promise<Subscription> {
    console.log("🔄 Calling reactivateSubscription API...");
    const response = await api.post("/api/subscriptions/current/reactivate");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  // Invoices endpoints
  static async getInvoices(): Promise<Invoice[]> {
    console.log("🔄 Calling getInvoices API...");
    const response = await api.get("/api/subscriptions/invoices");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async downloadInvoice(invoiceId: number): Promise<Blob> {
    console.log(`🔄 Calling downloadInvoice API for ID ${invoiceId}...`);
    const response = await api.get(
      `/api/subscriptions/invoices/${invoiceId}/download`,
      {
        responseType: "blob",
      }
    );

    return response.data;
  }

  // Usage endpoints
  static async getUsage(): Promise<SubscriptionUsage> {
    console.log("🔄 Calling getUsage API...");
    const response = await api.get("/api/subscriptions/usage");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  // Payment Methods endpoints
  static async getPaymentMethods(): Promise<PaymentMethod[]> {
    console.log("🔄 Calling getPaymentMethods API...");
    const response = await api.get("/api/payment-methods");

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async addPaymentMethod(
    paymentMethodId: string
  ): Promise<PaymentMethod> {
    console.log("🔄 Calling addPaymentMethod API...");
    const response = await api.post("/api/payment-methods", {
      payment_method_id: paymentMethodId,
    });

    if (response.data && response.data.data) {
      return response.data.data;
    }

    return response.data;
  }

  static async setDefaultPaymentMethod(paymentMethodId: string): Promise<void> {
    console.log("🔄 Calling setDefaultPaymentMethod API...");
    await api.put(`/api/payment-methods/${paymentMethodId}/default`);
  }

  static async deletePaymentMethod(paymentMethodId: string): Promise<void> {
    console.log("🔄 Calling deletePaymentMethod API...");
    await api.delete(`/api/payment-methods/${paymentMethodId}`);
  }

  // Health check
  static async healthCheck(): Promise<any> {
    console.log("🔄 Calling healthCheck API...");
    const response = await api.get("/health");
    return response.data;
  }
}
