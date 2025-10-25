import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { User } from "../types";

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setAuth: (user: User, token: string) => {
        console.log("🔐 Setting auth in store:", {
          user,
          token: token.substring(0, 20) + "...",
        });
        set({
          user,
          token,
          isAuthenticated: true,
        });

        // Verificar que se guardó correctamente
        const state = get();
        console.log("✅ Auth state after setting:", {
          user: state.user?.email,
          hasToken: !!state.token,
          isAuthenticated: state.isAuthenticated,
        });
      },

      logout: () => {
        console.log("🚪 Logging out...");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      clearAuth: () => {
        console.log("🧹 Clearing auth...");
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },
    }),
    {
      name: "talavera-auth-storage", // Nombre único para el localStorage
      storage: createJSONStorage(() => localStorage), // Usar localStorage
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        console.log("🔄 Rehydrating auth state:", {
          user: state?.user?.email,
          hasToken: !!state?.token,
          isAuthenticated: state?.isAuthenticated,
        });
      },
    }
  )
);
