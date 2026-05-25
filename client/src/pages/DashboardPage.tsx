import { useEffect, useMemo } from "react";
import {
  Badge,
  BarChart,
  PageShell,
  Panel,
  SectionList,
  StatCard,
} from "../components/Ui";
import { useAnalyticsStore } from "../store/analyticsStore";
import { asRecord, formatDate, formatMoney, toArray } from "../utils/viewData";

export function DashboardPage() {
  const analytics = useAnalyticsStore((state) => state.analytics);
  const isLoading = useAnalyticsStore((state) => state.isLoading);
  const error = useAnalyticsStore((state) => state.error);
  const { get: getAnalytics } = useAnalyticsStore((state) => state.actions);

  useEffect(() => {
    void getAnalytics();
  }, [getAnalytics]);

  const analyticsRecord = asRecord(analytics) || {};
  const recentInvoices = toArray<Record<string, unknown>>(
    analyticsRecord.recentInvoices,
  );
  const monthlyRevenue = toArray<{ revenue?: unknown }>(
    analyticsRecord.monthlyRevenue,
  );
  const chartValues = useMemo(() => {
    const values = monthlyRevenue.map((entry) => Number(entry.revenue ?? 0));
    const max = Math.max(...values, 1);
    return values.length
      ? values.map((value) => Math.max(10, Math.round((value / max) * 100)))
      : [24, 42, 58, 74, 91];
  }, [monthlyRevenue]);

  const stats = [
    {
      label: "Revenue collected",
      value: formatMoney(analyticsRecord.totalRevenue ?? 0),
      delta: "Finance",
      tone: "sky" as const,
    },
    {
      label: "Customers",
      value: String(analyticsRecord.customerCount ?? 0),
      delta: "Lead",
      tone: "emerald" as const,
    },
    {
      label: "Recent invoices",
      value: String(recentInvoices.length || 0),
      delta: "Activity",
      tone: "slate" as const,
    },
  ];

  const invoiceRows = recentInvoices;

  return (
    <PageShell
      eyebrow="Executive overview"
      title="Keep revenue, customers, and payments in one polished command center."
      description=""
    >
      {error ? (
        <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#B91C1C]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.35fr_0.9fr]">
        <Panel title="Collections trend" subtitle="Monthly revenue">
          <BarChart values={chartValues} />
        </Panel>

        <Panel
          title="Quick actions"
          subtitle="Common tasks users expect on first load"
        >
          <div className="grid gap-3">
            {[
              "Create invoice draft",
              "Add a new customer",
              "Send a receipt reminder",
            ].map((item) => (
              <button
                key={item}
                className="flex items-center justify-between rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] px-4 py-4 text-left text-sm text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
              >
                <span>{item}</span>
                <span className="text-[#64748B]">→</span>
              </button>
            ))}
          </div>
        </Panel>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel
          title="Recent invoices"
          subtitle="The five most recent invoices returned by analytics"
        >
          {isLoading ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Loading invoice data...
            </div>
          ) : null}
          <div className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF]">
            <table className="min-w-full divide-y divide-[#E2E8F0] text-left text-sm">
              <thead className="bg-[#F8FAFC] text-[#64748B]">
                <tr>
                  <th className="px-4 py-3 font-medium">Invoice</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Amount</th>
                  <th className="px-4 py-3 font-medium">Due</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {invoiceRows.map((row, index) => (
                  <tr
                    key={String(row.id ?? row.invoiceNumber ?? index)}
                    className="bg-[#FFFFFF]"
                  >
                    <td className="px-4 py-4 font-medium text-[#0F172A]">
                      {String(row.invoiceNumber ?? row.number ?? "—")}
                    </td>
                    <td className="px-4 py-4 text-[#64748B]">
                      {String(
                        asRecord(row.customer)?.name ?? row.customerName ?? "—",
                      )}
                    </td>
                    <td className="px-4 py-4">
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
                    </td>
                    <td className="px-4 py-4 text-[#0F172A]">
                      {formatMoney(row.total ?? row.amount ?? 0)}
                    </td>
                    <td className="px-4 py-4 text-[#64748B]">
                      {formatDate(row.dueDate ?? row.due ?? row.issueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel
          title="Activity stream"
          subtitle="Recent invoices turned into a live activity feed"
        >
          <SectionList
            items={invoiceRows.slice(0, 5).map((row) => ({
              title: String(row.invoiceNumber ?? row.number ?? "Invoice"),
              detail: `${String(asRecord(row.customer)?.name ?? row.customerName ?? "Customer")} · ${formatMoney(row.total ?? row.amount ?? 0)}`,
              time: formatDate(row.updatedAt ?? row.createdAt ?? row.issueDate),
            }))}
          />
        </Panel>
      </div>
    </PageShell>
  );
}
