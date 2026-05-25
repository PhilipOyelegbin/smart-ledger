import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";
import { useBusinessStore } from "../store/businessStore";
import { useCustomerStore } from "../store/customerStore";
import { useInvoiceStore } from "../store/invoiceStore";
import { asRecord, formatDate, formatMoney, toArray } from "../utils/viewData";

type InvoiceFormValues = {
  customerId: string;
  tax: string;
  issueDate: string;
  dueDate: string;
  notes: string;
  description: string;
  quantity: string;
  unitPrice: string;
};

const emptyInvoice: InvoiceFormValues = {
  customerId: "",
  tax: "0",
  issueDate: new Date().toISOString().slice(0, 10),
  dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  notes: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
};

const invoiceSchema = yup.object({
  customerId: yup.string().required("Customer is required"),
  tax: yup.string().required("Tax is required"),
  issueDate: yup.string().required("Issue date is required"),
  dueDate: yup.string().required("Due date is required"),
  notes: yup.string().nullable(),
  description: yup
    .string()
    .min(2, "Line item description is required")
    .required("Line item description is required"),
  quantity: yup.string().required("Quantity is required"),
  unitPrice: yup.string().required("Unit price is required"),
});

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  useAuthStore((state) => state.user);
  const businesses = useBusinessStore((state) => state.businesses);
  const customers = useCustomerStore((state) => state.customers);
  const { get: getCustomers } = useCustomerStore((state) => state.actions);
  const { getAll: getBusinesses } = useBusinessStore((state) => state.actions);
  const invoices = useInvoiceStore((state) => state.invoices);
  const isLoading = useInvoiceStore((state) => state.isLoading);
  const message = useInvoiceStore((state) => state.message);
  const error = useInvoiceStore((state) => state.error);
  const { create, deleteById, get, sendInvoice, update } = useInvoiceStore(
    (state) => state.actions,
  );
  const [selectedInvoice, setSelectedInvoice] = useState<{
    id?: string;
    customerId?: string;
    tax?: string;
    issueDate?: string;
    dueDate?: string;
    notes?: string;
    description?: string;
    quantity?: string;
    unitPrice?: string;
  } | null>(null);

  const businessRows = toArray<Record<string, unknown>>(businesses);
  const customerRows = toArray<Record<string, unknown>>(customers);
  const invoiceRows = toArray<Record<string, unknown>>(invoices);
  const invoiceMeta = asRecord(invoices)?.meta as
    | {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      }
    | undefined;
  const selectedBusinessId = searchParams.get("businessId") ?? "";
  const customerIdFilter = searchParams.get("customerId") ?? "";
  const invoicePage = parsePositiveInt(searchParams.get("page"), 1);
  const invoiceLimit = parsePositiveInt(searchParams.get("limit"), 12);
  const activeBusinessId =
    selectedBusinessId || String(asRecord(businessRows[0])?.id ?? "");

  useEffect(() => {
    void getBusinesses();
  }, [getBusinesses]);

  useEffect(() => {
    if (!selectedBusinessId && businessRows.length > 0) {
      const firstBusinessId = String(asRecord(businessRows[0])?.id ?? "");
      if (firstBusinessId) {
        const next = new URLSearchParams(searchParams);
        next.set("businessId", firstBusinessId);
        setSearchParams(next, { replace: true });
      }
    }
  }, [businessRows, selectedBusinessId, searchParams, setSearchParams]);

  useEffect(() => {
    if (activeBusinessId) {
      void get(
        activeBusinessId,
        customerIdFilter,
        "",
        "",
        invoicePage,
        invoiceLimit,
        "createdAt",
        "DESC",
      );
      void getCustomers(activeBusinessId, "", 1, 25);
    }
  }, [
    activeBusinessId,
    customerIdFilter,
    get,
    getCustomers,
    invoiceLimit,
    invoicePage,
  ]);

  const formik = useFormik<InvoiceFormValues>({
    initialValues: selectedInvoice
      ? {
          customerId: String(selectedInvoice.customerId ?? ""),
          tax: String(selectedInvoice.tax ?? "0"),
          issueDate: String(
            selectedInvoice.issueDate ?? emptyInvoice.issueDate,
          ),
          dueDate: String(selectedInvoice.dueDate ?? emptyInvoice.dueDate),
          notes: String(selectedInvoice.notes ?? ""),
          description: String(selectedInvoice.description ?? ""),
          quantity: String(selectedInvoice.quantity ?? "1"),
          unitPrice: String(selectedInvoice.unitPrice ?? "0"),
        }
      : emptyInvoice,
    enableReinitialize: true,
    validationSchema: invoiceSchema,
    onSubmit: async (values, helpers) => {
      if (!activeBusinessId) {
        helpers.setStatus("Create a business profile first.");
        return;
      }

      try {
        const payload = {
          businessId: activeBusinessId,
          customerId: values.customerId,
          tax: values.tax,
          items: [
            {
              description: values.description,
              quantity: Number(values.quantity),
              unitPrice: Number(values.unitPrice),
            },
          ],
          issueDate: values.issueDate,
          dueDate: values.dueDate,
          notes: values.notes,
        };

        if (selectedInvoice?.id) {
          await update(selectedInvoice.id, payload);
        } else {
          await create(payload);
        }

        helpers.resetForm();
        setSelectedInvoice(null);
        await get(
          activeBusinessId,
          customerIdFilter,
          "",
          "",
          invoicePage,
          invoiceLimit,
          "createdAt",
          "DESC",
        );
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save invoice",
        );
      }
    },
  });

  const overdueCount = useMemo(
    () =>
      invoiceRows.filter((invoice) =>
        String(invoice.status ?? "")
          .toLowerCase()
          .includes("overdue"),
      ).length,
    [invoiceRows],
  );

  const customerOptions = customerRows.map((customer) => ({
    id: String(customer.id ?? ""),
    label: String(customer.name ?? customer.businessName ?? "Customer"),
  }));

  useEffect(() => {
    if (customerIdFilter && formik.values.customerId !== customerIdFilter) {
      formik.setFieldValue("customerId", customerIdFilter);
      return;
    }

    if (!formik.values.customerId && customerOptions[0]?.id) {
      formik.setFieldValue("customerId", customerOptions[0].id);
    }
  }, [customerIdFilter, customerOptions, formik]);

  const handleEdit = (invoice: Record<string, unknown>) => {
    setSelectedInvoice({
      id: String(invoice.id ?? ""),
      customerId: String(asRecord(invoice.customer)?.id ?? ""),
      tax: String(invoice.tax ?? "0"),
      issueDate: String(invoice.issueDate ?? emptyInvoice.issueDate),
      dueDate: String(invoice.dueDate ?? emptyInvoice.dueDate),
      notes: String(invoice.notes ?? ""),
      description: String(asRecord(invoice.items)?.description ?? ""),
      quantity: String(asRecord(invoice.items)?.quantity ?? "1"),
      unitPrice: String(asRecord(invoice.items)?.unitPrice ?? "0"),
    });
  };

  const handleDelete = async (invoiceId: string) => {
    await deleteById(invoiceId);
    if (activeBusinessId) {
      await get(
        activeBusinessId,
        customerIdFilter,
        "",
        "",
        invoicePage,
        invoiceLimit,
        "createdAt",
        "DESC",
      );
    }
  };

  const handleSend = async (invoiceId: string) => {
    await sendInvoice(invoiceId);
    if (activeBusinessId) {
      await get(
        activeBusinessId,
        customerIdFilter,
        "",
        "",
        invoicePage,
        invoiceLimit,
        "createdAt",
        "DESC",
      );
    }
  };

  return (
    <PageShell
      eyebrow="Invoice workspace"
      title="Manage invoices in a list with editing, sending and deleting actions."
      description="This page shows live invoice records, lets you edit, and send an invoice to the customer."
      action={<Badge tone="indigo">Invoicing</Badge>}
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
              Choose the business for this invoice view
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px] lg:grid-cols-[1.5fr_0.8fr_0.8fr]">
            <label className="space-y-2 text-sm sm:col-span-2 lg:col-span-1">
              <span className="text-[#64748B]">Business</span>
              <select
                value={selectedBusinessId}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value) {
                    next.set("businessId", event.target.value);
                  } else {
                    next.delete("businessId");
                  }
                  next.set("page", "1");
                  setSearchParams(next, { replace: true });
                }}
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
              <span className="text-[#64748B]">Customer</span>
              <select
                value={customerIdFilter}
                onChange={(event) => {
                  const next = new URLSearchParams(searchParams);
                  if (event.target.value) {
                    next.set("customerId", event.target.value);
                  } else {
                    next.delete("customerId");
                  }
                  next.set("page", "1");
                  setSearchParams(next, { replace: true });
                }}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
              >
                <option value="">All customers</option>
                {customerRows.map((customer) => {
                  const customerId = String(customer.id ?? "");
                  return (
                    <option key={customerId} value={customerId}>
                      {String(
                        customer.name ?? customer.businessName ?? "Customer",
                      )}
                    </option>
                  );
                })}
              </select>
            </label>

            <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-3 lg:justify-end">
              <button
                type="button"
                onClick={() => {
                  const next = new URLSearchParams(searchParams);
                  next.delete("businessId");
                  next.delete("customerId");
                  setSearchParams(next, { replace: true });
                }}
                className="rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-sm font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
              >
                Clear filters
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Invoice list"
          subtitle="List rows for quick scanning, editing, and sending"
        >
          {isLoading ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Loading invoices...
            </div>
          ) : null}
          <div className="mt-4 space-y-3">
            {invoiceRows.map((row, index) => {
              const rowId = String(row.id ?? row.invoiceNumber ?? index);

              return (
                <article
                  key={rowId}
                  className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-[#0F172A]">
                          {String(row.invoiceNumber ?? row.number ?? "—")}
                        </h3>
                        <Badge
                          tone={
                            String(row.status) === "PAID" ||
                            String(row.status) === "Paid"
                              ? "emerald"
                              : String(row.status) === "SENT" ||
                                  String(row.status) === "Sent"
                                ? "sky"
                                : String(row.status) === "OVERDUE" ||
                                    String(row.status) === "Overdue"
                                  ? "rose"
                                  : "slate"
                          }
                        >
                          {String(row.status ?? "Draft")}
                        </Badge>
                      </div>

                      <p className="text-sm text-[#64748B]">
                        {String(
                          asRecord(row.customer)?.name ??
                            row.customerName ??
                            "No customer",
                        )}
                      </p>

                      <div className="space-y-1 text-sm text-[#64748B]">
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Issue date:
                          </span>{" "}
                          {formatDate(row.issueDate)}
                        </p>
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Due date:
                          </span>{" "}
                          {formatDate(row.dueDate)}
                        </p>
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Total:
                          </span>{" "}
                          {formatMoney(row.total ?? row.amount ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => void handleEdit(row)}
                        className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleSend(String(row.id ?? ""))}
                        className="rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#2563EB]/20"
                      >
                        Send
                      </button>
                      <button
                        type="button"
                        onClick={() => void handleDelete(String(row.id ?? ""))}
                        className="rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#EF4444]/20"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-sm text-[#64748B]">
            <span>
              Showing page {invoiceMeta?.page ?? invoicePage} of{" "}
              {invoiceMeta?.totalPages ?? 1}. Total invoices:{" "}
              {invoiceMeta?.total ?? invoiceRows.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(invoiceMeta?.page ?? invoicePage) <= 1}
                onClick={() =>
                  setSearchParams(
                    (current) => {
                      const next = new URLSearchParams(current);
                      next.set("page", String(Math.max(1, invoicePage - 1)));
                      return next;
                    },
                    { replace: true },
                  )
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  (invoiceMeta?.page ?? invoicePage) >=
                  (invoiceMeta?.totalPages ?? 1)
                }
                onClick={() =>
                  setSearchParams(
                    (current) => {
                      const next = new URLSearchParams(current);
                      next.set(
                        "page",
                        String(
                          Math.min(
                            invoiceMeta?.totalPages ?? 1,
                            invoicePage + 1,
                          ),
                        ),
                      );
                      return next;
                    },
                    { replace: true },
                  )
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>

        <Panel
          title={selectedInvoice ? "Edit invoice" : "Create invoice"}
          subtitle="Create a new invoice or edit existing invoice."
        >
          {!activeBusinessId ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Create a business profile first to unlock invoices.
            </div>
          ) : null}

          <form className="grid gap-4" onSubmit={formik.handleSubmit}>
            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Customer</span>
              <select
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                {...formik.getFieldProps("customerId")}
              >
                <option value="">Select customer</option>
                {customerOptions.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.label}
                  </option>
                ))}
              </select>
            </label>

            {[
              ["tax", "Tax %", "15"],
              ["issueDate", "Issue date", emptyInvoice.issueDate],
              ["dueDate", "Due date", emptyInvoice.dueDate],
              ["description", "Line item description", "Design package"],
              ["quantity", "Quantity", "1"],
              ["unitPrice", "Unit price", "250"],
            ].map(([field, label, placeholder]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="text-[#64748B]">{label}</span>
                <input
                  type={
                    field === "issueDate" || field === "dueDate"
                      ? "date"
                      : field === "quantity" ||
                          field === "unitPrice" ||
                          field === "tax"
                        ? "number"
                        : "text"
                  }
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                  {...formik.getFieldProps(field)}
                />
                {formik.touched[field as keyof InvoiceFormValues] &&
                formik.errors[field as keyof InvoiceFormValues] ? (
                  <span className="text-xs text-[#EF4444]">
                    {formik.errors[field as keyof InvoiceFormValues]}
                  </span>
                ) : null}
              </label>
            ))}

            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Notes</span>
              <textarea
                rows={4}
                placeholder="Payment terms, thanks note, or special instructions"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                {...formik.getFieldProps("notes")}
              />
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || formik.isSubmitting || !activeBusinessId}
                className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading || formik.isSubmitting
                  ? "Saving invoice..."
                  : selectedInvoice?.id
                    ? "Update invoice"
                    : "Create invoice"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedInvoice(null);
                  formik.resetForm();
                }}
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
        </Panel>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          title="Delivery workflow"
          subtitle="Live metrics for the invoice delivery pipeline"
        >
          <div className="space-y-4">
            {[
              {
                title: "Draft invoices",
                detail:
                  "Create invoice records in draft status before sending to customers.",
                done: invoiceRows.length > 0,
              },
              {
                title: "Send invoice",
                detail: "Use the send action to trigger email delivery.",
                done: overdueCount === 0,
              },
              {
                title: "Close balances",
                detail: "Reconcile paid invoices and create receipts.",
                done: invoiceRows.some((invoice) =>
                  String(invoice.status ?? "")
                    .toLowerCase()
                    .includes("paid"),
                ),
              },
            ].map((step, index) => (
              <div
                key={step.title}
                className="flex gap-4 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-4"
              >
                <div
                  className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-semibold ${
                    step.done
                      ? "bg-[#10B981]/10 text-[#10B981]"
                      : "bg-[#F8FAFC] text-[#64748B]"
                  }`}
                >
                  {index + 1}
                </div>
                <div>
                  <h3 className="font-semibold text-[#0F172A]">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-[#64748B]">
                    {step.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Panel>

        <Panel
          title="Customer pool"
          subtitle="Metrics for customers with active invoices and total invoice count"
        >
          <div className="space-y-3 text-sm text-[#64748B]">
            <p>Business ID: {activeBusinessId || "—"}</p>
            <p>Customers loaded: {customerRows.length}</p>
            <p>Invoices loaded: {invoiceRows.length}</p>
          </div>
        </Panel>
      </div>
    </PageShell>
  );
}
