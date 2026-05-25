import apiRequest from "./index";

export const api = {
  // Authentication
  register: (payload: unknown) => {
    return apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  verifyEmail: (payload: unknown) => {
    return apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  login: (payload: unknown) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  refresh: (payload: unknown) => {
    return apiRequest("/auth/refresh", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  logout: (payload: unknown) => {
    return apiRequest("/auth/logout", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  forgotPassword: (payload: unknown) => {
    return apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  resetPassword: (payload: unknown) => {
    return apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },

  // User
  getUser: () => apiRequest("/users/me"),

  // Business
  createBusiness: (payload: unknown) => {
    return apiRequest("/businesses", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getBusinesses: () => apiRequest("/businesses"),
  getBusiness: (id: string) => apiRequest(`/businesses/${id}`),
  updateBusiness: (id: string, payload: unknown) => {
    return apiRequest(`/businesses/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteBusiness: (id: string) => {
    return apiRequest(`/businesses/${id}`, { method: "DELETE" });
  },

  // Customers
  createCustomer: (payload: unknown) => {
    return apiRequest("/customers", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getCustomers: (
    businessId: string,
    search: string,
    page: number,
    limit: number,
  ) =>
    apiRequest(
      `/customers?businessId=${businessId}&search=${search}&page=${page}&limit=${limit}`,
    ),
  getCustomerById: (id: string) => apiRequest(`/customers/${id}`),
  updateCustomer: (id: string, payload: unknown) => {
    return apiRequest(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteCustomer: (id: string) => {
    return apiRequest(`/customers/${id}`, { method: "DELETE" });
  },
  getCustomerInvoices: (id: string) => apiRequest(`/customers/${id}/invoices`),

  // Invoice
  createInvoice: (payload: unknown) => {
    return apiRequest("/invoices", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getInvoice: (
    businessId?: string,
    customerId?: string,
    status?: string,
    search?: string,
    page?: number,
    limit?: number,
    sortBy?: string,
    sortOrder?: string,
  ) => {
    const query = new URLSearchParams();

    if (businessId) query.set("businessId", businessId);
    if (customerId) query.set("customerId", customerId);
    if (status) query.set("status", status);
    if (search) query.set("search", search);
    if (page) query.set("page", String(page));
    if (limit) query.set("limit", String(limit));
    if (sortBy) query.set("sortBy", sortBy);
    if (sortOrder) query.set("sortOrder", sortOrder);

    const queryString = query.toString();
    return apiRequest(`/invoices${queryString ? `?${queryString}` : ""}`);
  },
  getInvoiceById: (id: string) => apiRequest(`/invoices/${id}`),
  updateInvoice: (id: string, payload: unknown) => {
    return apiRequest(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
  },
  deleteInvoice: (id: string) => {
    return apiRequest(`/invoices/${id}`, { method: "DELETE" });
  },
  viewInvoicePdf: (id: string) => apiRequest(`/invoices/${id}/pdf`),
  sendInvoice: (id: string) => {
    return apiRequest(`/invoices/${id}/send`, { method: "POST" });
  },

  // Receipt
  createReceipt: (payload: unknown) => {
    return apiRequest("/receipts", {
      method: "POST",
      body: JSON.stringify(payload),
    });
  },
  getReceipt: (
    businessId: string,
    search: string,
    page: number,
    limit: number,
    sortBy: string,
    sortOrder: string,
  ) =>
    apiRequest(
      `/receipts?businessId=${businessId}&search=${search}&page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}`,
    ),
  getReceiptById: (id: string) => apiRequest(`/receipts/${id}`),
  viewReceiptPdf: (id: string) => apiRequest(`/receipts/${id}/pdf`),
  sendReceipt: (id: string) => {
    return apiRequest(`/receipts/${id}/send`, { method: "POST" });
  },

  // Analytics
  getAnalytics: () => apiRequest(`/analytics/dashboard`),
};
