import { create } from "zustand";
import { api } from "../api/client";

interface CustomerState {
  customers: unknown;
  customer: unknown;
  invoices: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    create: (payload: {
      businessId: string;
      name: string;
      email: string;
      phone: string;
      address: string;
    }) => void;
    get: (
      businessId: string,
      search: string,
      page: number,
      limit: number,
    ) => void;
    getById: (id: string) => void;
    update: (
      id: string,
      payload: {
        businessId: string;
        name: string;
        email: string;
        phone: string;
        address: string;
      },
    ) => void;
    deleteById: (id: string) => void;
    getInvoices: (id: string) => void;
  };
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  customer: {},
  invoices: [],
  isLoading: false,
  message: null,
  error: null,
  actions: {
    create: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.createCustomer(payload);
        set({
          customer: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Customer creation failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    get: async (businessId, search, page, limit) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getCustomers(
          businessId,
          search,
          page,
          limit,
        );
        set({
          customers: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Customer search failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getCustomerById(id);
        set({
          customer: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Customer fetch failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    update: async (id, payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.updateCustomer(id, payload);
        set({
          customer: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Customer update failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    deleteById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.deleteCustomer(id);
        set({
          customer: {},
          message,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Customer deletion failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getInvoices: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getCustomerInvoices(id);
        set({
          invoices: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Customer invoices fetch failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

export const useCustomerAction = () =>
  useCustomerStore((state) => state.actions);
