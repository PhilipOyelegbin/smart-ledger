import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";
import { useBusinessStore } from "../store/businessStore";
import { useCustomerStore } from "../store/customerStore";
import { asRecord, getPrimaryBusinessId, toArray } from "../utils/viewData";

type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const emptyCustomer: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

const customerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Customer name is required")
    .required("Customer name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Customer email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup
    .string()
    .min(5, "Enter a full address")
    .required("Address is required"),
});

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function CustomersPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const businesses = useBusinessStore((state) => state.businesses);
  const customers = useCustomerStore((state) => state.customers);
  const isLoading = useCustomerStore((state) => state.isLoading);
  const message = useCustomerStore((state) => state.message);
  const error = useCustomerStore((state) => state.error);
  const { getAll: getBusinesses } = useBusinessStore((state) => state.actions);
  const { create, deleteById, get } = useCustomerStore(
    (state) => state.actions,
  );

  const businessRows = toArray<Record<string, unknown>>(businesses);
  const selectedBusinessId = searchParams.get("businessId") ?? "";
  const fallbackBusinessId = getPrimaryBusinessId(user, businessRows);
  const businessId = selectedBusinessId || fallbackBusinessId;
  const customerPage = parsePositiveInt(searchParams.get("page"), 1);
  const customerLimit = parsePositiveInt(searchParams.get("limit"), 12);
  const customerSearch = searchParams.get("search") ?? "";

  const customerRows = toArray<Record<string, unknown>>(customers);
  const customerMeta = asRecord(customers)?.meta as
    | {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      }
    | undefined;

  useEffect(() => {
    void getBusinesses();
  }, [getBusinesses]);

  useEffect(() => {
    if (!selectedBusinessId && businessRows.length > 0) {
      const firstBusiness = asRecord(businessRows[0]);
      const firstBusinessId = String(firstBusiness?.id ?? "");
      if (firstBusinessId) {
        updateSearchParams({ businessId: firstBusinessId, page: 1 });
      }
    }
  }, [businessRows, selectedBusinessId]);

  useEffect(() => {
    if (businessId) {
      void get(businessId, customerSearch, customerPage, customerLimit);
    }
  }, [businessId, customerSearch, customerPage, customerLimit, get]);

  const formik = useFormik<CustomerFormValues>({
    initialValues: emptyCustomer,
    validationSchema: customerSchema,
    onSubmit: async (values, helpers) => {
      if (!businessId) {
        helpers.setStatus("Select a business above first.");
        return;
      }

      try {
        await create({ businessId, ...values });
        helpers.resetForm();
        await get(businessId, customerSearch, customerPage, customerLimit);
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save customer",
        );
      }
    },
  });

  const totalPages = customerMeta?.totalPages ?? 1;
  const totalCustomers = customerMeta?.total ?? customerRows.length;
  const selectedBusiness = businessRows.find((item) => {
    const row = asRecord(item);
    return String(row?.id ?? "") === selectedBusinessId;
  });

  const updateSearchParams = (
    updates: Record<string, string | number | null>,
  ) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === "") {
        next.delete(key);
      } else {
        next.set(key, String(value));
      }
    });
    setSearchParams(next, { replace: true });
  };

  const handleDelete = async (customerId: string) => {
    await deleteById(customerId);
    if (businessId) {
      await get(businessId, customerSearch, customerPage, customerLimit);
    }
  };

  const handleViewInvoices = (customerId: string) => {
    navigate(`/invoices?customerId=${customerId}`);
  };

  return (
    <PageShell
      eyebrow="Customer CRM"
      title="Manage paginated customers and create new ones from one place."
      description="Filter the customer list, move between pages, and open edit or invoice history actions from each customer card."
      action={<Badge tone="sky">Onboarding</Badge>}
    >
      {error ? (
        <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <div className="mb-4 rounded-3xl border border-[#E2E8F0] bg-white p-4 shadow-[0_24px_80px_rgba(37,99,235,0.05)]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
              Business filter
            </p>
            <h3 className="mt-2 text-lg font-semibold text-[#0F172A]">
              Choose the business for this customer view
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px] lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <label className="space-y-2 text-sm sm:col-span-2 lg:col-span-1">
              <span className="text-[#64748B]">Business</span>
              <select
                value={selectedBusinessId}
                onChange={(event) =>
                  updateSearchParams({
                    businessId: event.target.value,
                    page: 1,
                  })
                }
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
              >
                <option value="">Select a business</option>
                {businessRows.map((item) => {
                  const row = asRecord(item);
                  const rowId = String(row?.id ?? "");
                  return (
                    <option key={rowId} value={rowId}>
                      {String(row?.businessName ?? "Business")}
                    </option>
                  );
                })}
              </select>
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Search</span>
              <input
                value={customerSearch}
                onChange={(event) =>
                  updateSearchParams({ search: event.target.value, page: 1 })
                }
                placeholder="Search customers"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Per page</span>
              <select
                value={customerLimit}
                onChange={(event) =>
                  updateSearchParams({ limit: event.target.value, page: 1 })
                }
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
              >
                {[6, 12, 18, 24].map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
              <button
                type="button"
                onClick={() =>
                  updateSearchParams({ businessId: "", search: "", page: 1 })
                }
                className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <Panel
          title="Customer directory"
          subtitle="Filtered, paginated results from the API"
        >
          <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
            Showing customers for:{" "}
            {String(
              asRecord(selectedBusiness)?.businessName ?? "all businesses",
            )}
          </div>

          {isLoading ? (
            <div className="mt-4 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Loading customers...
            </div>
          ) : null}

          <div className="mt-4 overflow-hidden rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF]">
            <ul className="divide-y divide-[#E2E8F0]">
              {customerRows.map((customer, index) => {
                const rowId = String(customer.id ?? customer.email ?? index);

                return (
                  <li
                    key={rowId}
                    className="grid grid-cols-[1.2fr_1fr_1fr_1.4fr_auto] gap-4 px-4 py-4 text-sm text-[#0F172A]"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold truncate">
                        {String(customer.name ?? "Customer")}
                      </p>
                    </div>
                    <div className="min-w-0 text-[#64748B] truncate">
                      {String(customer.email ?? "No email provided")}
                    </div>
                    <div className="min-w-0 text-[#64748B] truncate">
                      {String(customer.phone ?? "—")}
                    </div>
                    <div className="min-w-0 text-[#64748B] truncate">
                      {String(customer.address ?? "—")}
                    </div>
                    <div className="flex flex-wrap justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => navigate(`/customers/${rowId}/edit`)}
                        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(rowId)}
                        className="rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#EF4444]/20"
                      >
                        Delete
                      </button>
                      <button
                        type="button"
                        onClick={() => handleViewInvoices(rowId)}
                        className="rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#2563EB]/20"
                      >
                        View invoices
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          {!customerRows.length ? (
            <div className="mt-4 rounded-2xl border border-dashed border-[#CBD5E1] px-4 py-6 text-sm text-[#64748B]">
              {selectedBusinessId
                ? "No customers match the current filter."
                : "Select a business to load its customers."}
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-sm text-[#64748B]">
            <span>
              Showing page {customerMeta?.page ?? customerPage} of {totalPages}.
              Total customers: {totalCustomers}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(customerMeta?.page ?? customerPage) <= 1}
                onClick={() =>
                  updateSearchParams({ page: Math.max(1, customerPage - 1) })
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={(customerMeta?.page ?? customerPage) >= totalPages}
                onClick={() =>
                  updateSearchParams({
                    page: Math.min(totalPages, customerPage + 1),
                  })
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>

        <Panel title="Add customer" subtitle="Create a customer from this page">
          {!businessId ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Select a business above to unlock customer management.
            </div>
          ) : null}

          <form className="grid gap-4" onSubmit={formik.handleSubmit}>
            {[
              ["name", "Customer name", "Acme Inc"],
              ["email", "Email", "client@acme.com"],
              ["phone", "Phone", "+1 555 210 9087"],
              ["address", "Address", "48 Market Street, New York"],
            ].map(([field, label, placeholder]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="text-[#64748B]">{label}</span>
                <input
                  type={field === "email" ? "email" : "text"}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                  {...formik.getFieldProps(field)}
                />
                {formik.touched[field as keyof CustomerFormValues] &&
                formik.errors[field as keyof CustomerFormValues] ? (
                  <span className="text-xs text-[#EF4444]">
                    {formik.errors[field as keyof CustomerFormValues]}
                  </span>
                ) : null}
              </label>
            ))}

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || formik.isSubmitting || !businessId}
                className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading || formik.isSubmitting
                  ? "Saving customer..."
                  : "Create customer"}
              </button>
              <button
                type="button"
                onClick={() => formik.resetForm()}
                className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
              >
                Clear
              </button>
            </div>

            {formik.status || message ? (
              <div className="rounded-2xl border border-[#2563EB]/20 bg-[#2563EB]/10 px-4 py-3 text-sm text-[#1D4ED8]">
                {formik.status || message}
              </div>
            ) : null}
          </form>

          <div className="mt-6 space-y-3 text-sm text-[#64748B]">
            <p>Business ID: {businessId || "—"}</p>
            <p>Total customers: {totalCustomers}</p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
