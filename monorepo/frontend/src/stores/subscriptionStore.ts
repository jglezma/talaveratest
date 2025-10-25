import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { Subscription, SubscriptionUsage, Plan } from "../types";

interface SubscriptionState {
  subscription: Subscription | null;
  usage: SubscriptionUsage | null;
  currentPlan: Plan | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  setSubscription: (subscription: Subscription | null) => void;
  setUsage: (usage: SubscriptionUsage | null) => void;
  setCurrentPlan: (plan: Plan | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearSubscription: () => void;

  // Computed getters
  isSubscribed: () => boolean;
  isTrialing: () => boolean;
  isCancelled: () => boolean;
  daysUntilExpiry: () => number | null;
  usagePercentage: (type: "projects" | "storage") => number;
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      subscription: null,
      usage: null,
      currentPlan: null,
      isLoading: false,
      error: null,

      setSubscription: (subscription) => {
        console.log("💎 Setting subscription:", subscription);
        set({ subscription });
      },

      setUsage: (usage) => {
        console.log("📊 Setting usage:", usage);
        set({ usage });
      },

      setCurrentPlan: (plan) => {
        console.log("📋 Setting current plan:", plan);
        set({ currentPlan: plan });
      },

      setLoading: (loading) => set({ isLoading: loading }),

      setError: (error) => set({ error }),

      clearSubscription: () => {
        console.log("🧹 Clearing subscription data");
        set({
          subscription: null,
          usage: null,
          currentPlan: null,
          error: null,
        });
      },

      // Computed getters
      isSubscribed: () => {
        const { subscription } = get();
        return (
          subscription?.status === "active" ||
          subscription?.status === "trialing"
        );
      },

      isTrialing: () => {
        const { subscription } = get();
        return subscription?.status === "trialing";
      },

      isCancelled: () => {
        const { subscription } = get();
        return subscription?.cancel_at_period_end === true;
      },

      daysUntilExpiry: () => {
        const { subscription } = get();
        if (!subscription?.current_period_end) return null;

        const now = new Date();
        const expiry = new Date(subscription.current_period_end);
        const diffTime = expiry.getTime() - now.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        return diffDays > 0 ? diffDays : 0;
      },

      usagePercentage: (type: "projects" | "storage") => {
        const { usage } = get();
        if (!usage) return 0;

        if (type === "projects") {
          return usage.projects_limit > 0
            ? (usage.projects_used / usage.projects_limit) * 100
            : 0;
        } else {
          return usage.storage_limit > 0
            ? (usage.storage_used / usage.storage_limit) * 100
            : 0;
        }
      },
    }),
    {
      name: "talavera-subscription-storage",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        subscription: state.subscription,
        usage: state.usage,
        currentPlan: state.currentPlan,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("🔄 Rehydrating subscription state:", {
          hasSubscription: !!state?.subscription,
          planName: state?.currentPlan?.name,
          status: state?.subscription?.status,
        });
      },
    }
  )
);
