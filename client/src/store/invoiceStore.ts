import { create } from "zustand";
import { api } from "../api/client";

interface InvoiceState {
  invoices: unknown;
  invoice: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    create: (payload: {
      businessId: string;
      customerId: string;
      tax: string;
      items: { description: string; quantity: number; unitPrice: number }[];
      issueDate: string;
      dueDate: string;
      notes: string;
    }) => void;
    get: (
      businessId?: string,
      customerId?: string,
      status?: string,
      search?: string,
      page?: number,
      limit?: number,
      sortBy?: string,
      sortOrder?: string,
    ) => void;
    getById: (id: string) => void;
    update: (
      id: string,
      payload: {
        businessId: string;
        customerId: string;
        tax: string;
        items: { description: string; quantity: number; unitPrice: number }[];
        issueDate: string;
        dueDate: string;
        notes: string;
      },
    ) => void;
    deleteById: (id: string) => void;
    viewInvoice: (id: string) => void;
    sendInvoice: (id: string) => void;
  };
}

export const useInvoiceStore = create<InvoiceState>((set) => ({
  invoices: [],
  invoice: {},
  isLoading: false,
  message: null,
  error: null,
  actions: {
    create: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.createInvoice(payload);
        set({
          invoice: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice creation failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    get: async (
      businessId,
      customerId,
      status,
      search,
      page,
      limit,
      sortBy,
      sortOrder,
    ) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getInvoice(
          businessId ?? "",
          customerId ?? "",
          status ?? "",
          search ?? "",
          page ?? 1,
          limit ?? 20,
          sortBy ?? "createdAt",
          sortOrder ?? "DESC",
        );
        set({
          invoices: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice search failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    getById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getInvoiceById(id);
        set({
          invoice: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice fetch failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    update: async (id, payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.updateInvoice(id, payload);
        set({
          invoice: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice update failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    deleteById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.deleteInvoice(id);
        set({
          invoice: {},
          message,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice deletion failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    viewInvoice: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.viewInvoicePdf(id);
        set({
          invoice: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice PDF view failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    sendInvoice: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.sendInvoice(id);
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Invoice send failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

export const useInvoiceAction = () => useInvoiceStore((state) => state.actions);
