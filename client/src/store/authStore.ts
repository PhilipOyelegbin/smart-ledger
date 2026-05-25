import { create } from "zustand";
import { api } from "../api/client";

const accessToken = sessionStorage.getItem("accessToken");
const refreshToken = sessionStorage.getItem("refreshToken");

interface AuthState {
  access: string;
  refresh: string;
  user: unknown;
  isLoading: boolean;
  message: string | null;
  error: string | null;
  actions: {
    clearSession: () => void;
    me: () => Promise<void>;
    register: (payload: {
      name: string;
      email: string;
      password: string;
    }) => Promise<void>;
    login: (payload: { email: string; password: string }) => Promise<void>;
    verifyEmail: (token: string) => Promise<void>;
    refreshLogin: (refreshToken: string) => Promise<void>;
    forgotpassword: (email: string) => Promise<void>;
    resetPassword: (payload: {
      token: string;
      password: string;
    }) => Promise<void>;
    logout: (refreshToken: string) => Promise<void>;
  };
}

export const useAuthStore = create<AuthState>((set) => ({
  access: accessToken || "",
  refresh: refreshToken || "",
  user: {},
  isLoading: false,
  message: null,
  error: null,
  actions: {
    clearSession: () => {
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      set({ access: "", refresh: "", user: {} });
    },
    me: async () => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.getUser();
        set({ user: result, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Failed to load user";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    register: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.register(payload);
        sessionStorage.setItem("accessToken", result.tokens.accessToken);
        sessionStorage.setItem("refreshToken", result.tokens.refreshToken);
        set({
          access: result.tokens.accessToken,
          refresh: result.tokens.refreshToken,
          user: result.user,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Registration failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    login: async (payload) => {
      set({ isLoading: true, error: null });
      try {
        const { result } = await api.login(payload);
        sessionStorage.setItem("accessToken", result.tokens.accessToken);
        sessionStorage.setItem("refreshToken", result.tokens.refreshToken);
        set({
          access: result.tokens.accessToken,
          refresh: result.tokens.refreshToken,
          user: result.user,
          error: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : "Login failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    verifyEmail: async (token) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.verifyEmail({ token });
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Email verification failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    refreshLogin: async (refreshToken) => {
      set({ isLoading: true, error: null });
      try {
        const { message, result } = await api.refresh({ refreshToken });
        sessionStorage.setItem("accessToken", result.accessToken);
        sessionStorage.setItem("refreshToken", result.refreshToken);
        set({
          access: result.accessToken,
          refresh: result.refreshToken,
          message,
          error: null,
        });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Token refresh failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    forgotpassword: async (email) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.forgotPassword({ email });
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Password reset request failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    resetPassword: async (payload: { token: string; password: string }) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.resetPassword(payload);
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Password reset failed";
        set({ error: message });
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },
    logout: async (refreshToken) => {
      set({ isLoading: true, error: null });
      try {
        const { message } = await api.logout({ refreshToken });
        set({ message, error: null });
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Logout failed";
        set({ error: message });
        throw error;
      } finally {
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        set({ access: "", refresh: "", user: {} });
        set({ isLoading: false });
      }
    },
  },
}));

export const useAuthAction = () => useAuthStore((state) => state.actions);
