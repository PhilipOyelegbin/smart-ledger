import { create } from "zustand";
import { api } from "../api/client";

interface AnalyticsState {
  analytics: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    get: () => void;
  };
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  analytics: [],
  isLoading: false,
  message: null,
  error: null,
  actions: {
    get: async () => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getAnalytics();
        set({
          analytics: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Analytics fetch failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

export const useAnalyticsAction = () =>
  useAnalyticsStore((state) => state.actions);
