import { useEffect, useMemo, useState } from "react";
import { useFormik } from "formik";
import { useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useBusinessStore } from "../store/businessStore";
import { useInvoiceStore } from "../store/invoiceStore";
import { useReceiptStore } from "../store/receiptStore";
import { asRecord, formatDate, formatMoney, toArray } from "../utils/viewData";

type ReceiptFormValues = {
  invoiceId: string;
  amountPaid: string;
  paymentMethod: string;
  paymentDate: string;
};

const emptyReceipt: ReceiptFormValues = {
  invoiceId: "",
  amountPaid: "0",
  paymentMethod: "BANK_TRANSFER",
  paymentDate: new Date().toISOString().slice(0, 10),
};

const receiptSchema = yup.object({
  invoiceId: yup.string().required("Invoice is required"),
  amountPaid: yup.string().required("Amount paid is required"),
  paymentMethod: yup.string().required("Payment method is required"),
  paymentDate: yup.string().required("Payment date is required"),
});

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

const paymentMethods = ["CASH", "CARD", "BANK_TRANSFER", "PAYPAL", "OTHER"];

export function ReceiptPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const businesses = useBusinessStore((state) => state.businesses);
  const invoices = useInvoiceStore((state) => state.invoices);
  const receipts = useReceiptStore((state) => state.receipts);
  const isLoading = useReceiptStore((state) => state.isLoading);
  const message = useReceiptStore((state) => state.message);
  const error = useReceiptStore((state) => state.error);
  const { getAll: getBusinesses } = useBusinessStore((state) => state.actions);
  const { get: getInvoices } = useInvoiceStore((state) => state.actions);
  const { create, get, sendReceipt } = useReceiptStore(
    (state) => state.actions,
  );
  const [selectedReceipt, setSelectedReceipt] = useState<{
    id?: string;
    invoiceId?: string;
    amountPaid?: string;
    paymentMethod?: string;
    paymentDate?: string;
  } | null>(null);

  const businessRows = toArray<Record<string, unknown>>(businesses);
  const invoiceRows = toArray<Record<string, unknown>>(invoices);
  const receiptRows = toArray<Record<string, unknown>>(receipts);
  const receiptMeta = asRecord(receipts)?.meta as
    | {
        page?: number;
        limit?: number;
        total?: number;
        totalPages?: number;
      }
    | undefined;
  const selectedBusinessId = searchParams.get("businessId") ?? "";
  const receiptSearch = searchParams.get("search") ?? "";
  const receiptPage = parsePositiveInt(searchParams.get("page"), 1);
  const receiptLimit = parsePositiveInt(searchParams.get("limit"), 12);
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
        receiptSearch,
        receiptPage,
        receiptLimit,
        "createdAt",
        "DESC",
      );
      void getInvoices(
        activeBusinessId,
        "",
        "",
        "",
        1,
        100,
        "createdAt",
        "DESC",
      );
    }
  }, [
    activeBusinessId,
    receiptPage,
    receiptLimit,
    receiptSearch,
    get,
    getInvoices,
  ]);

  const formik = useFormik<ReceiptFormValues>({
    initialValues: selectedReceipt
      ? {
          invoiceId: String(selectedReceipt.invoiceId ?? ""),
          amountPaid: String(selectedReceipt.amountPaid ?? "0"),
          paymentMethod: String(
            selectedReceipt.paymentMethod ?? emptyReceipt.paymentMethod,
          ),
          paymentDate: String(
            selectedReceipt.paymentDate ?? emptyReceipt.paymentDate,
          ),
        }
      : emptyReceipt,
    enableReinitialize: true,
    validationSchema: receiptSchema,
    onSubmit: async (values, helpers) => {
      if (!activeBusinessId) {
        helpers.setStatus("Select a business above first.");
        return;
      }

      try {
        await create({
          invoiceId: values.invoiceId,
          amountPaid: values.amountPaid,
          paymentMethod: values.paymentMethod,
          paymentDate: values.paymentDate,
        });
        helpers.resetForm();
        setSelectedReceipt(null);
        await get(
          activeBusinessId,
          receiptSearch,
          receiptPage,
          receiptLimit,
          "createdAt",
          "DESC",
        );
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save receipt",
        );
      }
    },
  });

  const invoiceOptions = invoiceRows.map((invoice) => ({
    id: String(invoice.id ?? ""),
    label: `${String(invoice.invoiceNumber ?? "Invoice")} · ${String(asRecord(invoice.customer)?.name ?? invoice.customerName ?? "Customer")}`,
  }));

  const receiptCount = useMemo(() => receiptRows.length, [receiptRows]);

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

  const handleSend = async (receiptId: string) => {
    await sendReceipt(receiptId);
    if (activeBusinessId) {
      await get(
        activeBusinessId,
        receiptSearch,
        receiptPage,
        receiptLimit,
        "createdAt",
        "DESC",
      );
    }
  };

  return (
    <PageShell
      eyebrow="Receipt workspace"
      title="Track receipts in one list and create new ones quickly."
      description="List receipts, filter by business, and create new payment records."
      action={<Badge tone="emerald">Conclude</Badge>}
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
              Choose the business for this receipt view
            </h3>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:min-w-[520px] lg:grid-cols-[1.5fr_1fr_0.8fr]">
            <label className="space-y-2 text-sm sm:col-span-2 lg:col-span-1">
              <span className="text-[#64748B]">Business</span>
              <select
                value={selectedBusinessId}
                onChange={(event) => {
                  updateSearchParams({
                    businessId: event.target.value,
                    page: 1,
                  });
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
              <span className="text-[#64748B]">Search</span>
              <input
                value={receiptSearch}
                onChange={(event) =>
                  updateSearchParams({ search: event.target.value, page: 1 })
                }
                placeholder="Search receipts"
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              />
            </label>

            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Per page</span>
              <select
                value={receiptLimit}
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
          title="Receipt list"
          subtitle="All receipts recorded against invoices, with filtering and pagination controls."
        >
          {isLoading ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Loading receipts...
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {receiptRows.map((row, index) => {
              const rowId = String(row.id ?? row.receiptNumber ?? index);
              return (
                <article
                  key={rowId}
                  className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="font-semibold text-[#0F172A]">
                          {String(row.receiptNumber ?? "Receipt")}
                        </h3>
                        <Badge tone="emerald">Paid</Badge>
                      </div>
                      <p className="text-sm text-[#64748B]">
                        Invoice:{" "}
                        {String(asRecord(row.invoice)?.invoiceNumber ?? "—")} ·{" "}
                        {String(
                          asRecord(asRecord(row.invoice)?.customer)?.name ??
                            "Customer",
                        )}
                      </p>
                      <div className="space-y-1 text-sm text-[#64748B]">
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Payment date:
                          </span>{" "}
                          {formatDate(row.paymentDate)}
                        </p>
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Method:
                          </span>{" "}
                          {String(row.paymentMethod ?? "—")}
                        </p>
                        <p>
                          <span className="font-medium text-[#0F172A]">
                            Amount:
                          </span>{" "}
                          {formatMoney(row.amountPaid ?? 0)}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => void handleSend(rowId)}
                        className="rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] transition hover:bg-[#2563EB]/20"
                      >
                        Send receipt
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4 text-sm text-[#64748B]">
            <span>
              Showing page {receiptMeta?.page ?? receiptPage} of{" "}
              {receiptMeta?.totalPages ?? 1}. Total receipts:{" "}
              {receiptMeta?.total ?? receiptCount}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={(receiptMeta?.page ?? receiptPage) <= 1}
                onClick={() =>
                  updateSearchParams({ page: Math.max(1, receiptPage - 1) })
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <button
                type="button"
                disabled={
                  (receiptMeta?.page ?? receiptPage) >=
                  (receiptMeta?.totalPages ?? 1)
                }
                onClick={() =>
                  updateSearchParams({
                    page: Math.min(
                      receiptMeta?.totalPages ?? 1,
                      receiptPage + 1,
                    ),
                  })
                }
                className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </Panel>

        <Panel
          title="Create receipt"
          subtitle="Record a payment against an invoice"
        >
          {!activeBusinessId ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Select a business above to unlock receipt management.
            </div>
          ) : null}

          <form className="grid gap-4" onSubmit={formik.handleSubmit}>
            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Invoice</span>
              <select
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                {...formik.getFieldProps("invoiceId")}
              >
                <option value="">Select invoice</option>
                {invoiceOptions.map((invoice) => (
                  <option key={invoice.id} value={invoice.id}>
                    {invoice.label}
                  </option>
                ))}
              </select>
            </label>

            {[
              ["amountPaid", "Amount paid", "2500"],
              ["paymentDate", "Payment date", emptyReceipt.paymentDate],
            ].map(([field, label, placeholder]) => (
              <label key={field} className="space-y-2 text-sm">
                <span className="text-[#64748B]">{label}</span>
                <input
                  type={field === "paymentDate" ? "date" : "text"}
                  placeholder={placeholder}
                  className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                  {...formik.getFieldProps(field)}
                />
                {formik.touched[field as keyof ReceiptFormValues] &&
                formik.errors[field as keyof ReceiptFormValues] ? (
                  <span className="text-xs text-[#EF4444]">
                    {formik.errors[field as keyof ReceiptFormValues]}
                  </span>
                ) : null}
              </label>
            ))}

            <label className="space-y-2 text-sm">
              <span className="text-[#64748B]">Payment method</span>
              <select
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition focus:border-[#2563EB]"
                {...formik.getFieldProps("paymentMethod")}
              >
                {paymentMethods.map((method) => (
                  <option key={method} value={method}>
                    {method.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={isLoading || formik.isSubmitting || !activeBusinessId}
                className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading || formik.isSubmitting
                  ? "Saving receipt..."
                  : "Create receipt"}
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
        </Panel>
      </div>
    </PageShell>
  );
}
