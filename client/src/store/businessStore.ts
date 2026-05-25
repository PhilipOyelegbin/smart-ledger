import { create } from "zustand";
import { api } from "../api/client";

interface BusinessState {
  businesses: unknown;
  business: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    create: (payload: {
      businessName: string;
      logo: string;
      phone: string;
      email: string;
      address: string;
      taxNumber: string;
      bankName: string;
      accountName: string;
      accountNumber: string;
    }) => Promise<void>;
    getAll: () => Promise<void>;
    get: (id: string) => Promise<void>;
    update: (
      id: string,
      payload: {
        businessName: string;
        logo: string;
        phone: string;
        email: string;
        address: string;
        taxNumber: string;
        bankName: string;
        accountName: string;
        accountNumber: string;
      },
    ) => Promise<void>;
    deleteById: (id: string) => Promise<void>;
  };
}

export const useBusinessStore = create<BusinessState>((set) => ({
  businesses: [],
  business: {},
  isLoading: false,
  message: null,
  error: null,
  actions: {
    create: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.createBusiness(payload);
        set({
          business: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Business creation failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getAll: async () => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getBusinesses();
        set({
          businesses: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Businesses fetch failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    get: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getBusiness(id);
        set({
          business: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Business fetch failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    update: async (id, payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.updateBusiness(id, payload);
        set({
          business: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Business update failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    deleteById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.deleteBusiness(id);
        set({
          business: {},
          message,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Business deletion failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

export const useBusinessAction = () =>
  useBusinessStore((state) => state.actions);
