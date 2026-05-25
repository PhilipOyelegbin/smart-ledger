import { create } from "zustand";
import { api } from "../api/client";

interface ReceiptState {
  receipts: unknown;
  receipt: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    create: (payload: {
      invoiceId: string;
      amountPaid: string;
      paymentMethod: string;
      paymentDate: string;
    }) => void;
    get: (
      businessId: string,
      search: string,
      page: number,
      limit: number,
      sortBy: string,
      sortOrder: string,
    ) => void;
    getById: (id: string) => void;
    viewReceipt: (id: string) => void;
    sendReceipt: (id: string) => void;
  };
}

export const useReceiptStore = create<ReceiptState>((set) => ({
  receipts: [],
  receipt: {},
  isLoading: false,
  message: null,
  error: null,
  actions: {
    create: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.createReceipt(payload);
        set({
          receipt: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Receipt creation failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
    get: async (businessId, search, page, limit, sortBy, sortOrder) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getReceipt(
          businessId,
          search,
          page,
          limit,
          sortBy,
          sortOrder,
        );
        set({
          receipts: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Receipt search failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
    getById: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getReceiptById(id);
        set({
          receipt: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Receipt fetch failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
    viewReceipt: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.viewReceiptPdf(id);
        set({
          receipt: result,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Receipt PDF view failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
    sendReceipt: async (id) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.sendReceipt(id);
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Receipt send failed";
        set({ error: message });
      } finally {
        set({ isLoading: false });
      }
    },
  },
}));

export const useReceiptAction = () => useReceiptStore((state) => state.actions);
