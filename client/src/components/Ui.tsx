import type { ReactNode } from "react";
import type { Stat } from "../data";

export function PageShell({
  eyebrow,
  title,
  description,
  action,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  action?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-4 rounded-[2rem] border border-[#E2E8F0] bg-[#FFFFFF] p-6 shadow-[0_24px_80px_rgba(37,99,235,0.08)] md:p-8 xl:flex-row xl:items-end xl:justify-between">
        <div className="max-w-3xl space-y-3">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2563EB]">
            {eyebrow}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] md:text-5xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm leading-7 text-[#64748B] md:text-base">
            {description}
          </p>
        </div>
        {action ? (
          <div className="flex shrink-0 items-center gap-3">{action}</div>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function StatCard({ stat }: { stat: Stat }) {
  const accent =
    stat.tone === "sky"
      ? "from-[#2563EB]/10 to-[#2563EB]/5 text-[#0F172A] ring-[#2563EB]/15"
      : stat.tone === "indigo"
        ? "from-[#1D4ED8]/10 to-[#1D4ED8]/5 text-[#0F172A] ring-[#1D4ED8]/15"
        : stat.tone === "emerald"
          ? "from-[#10B981]/10 to-[#10B981]/5 text-[#0F172A] ring-[#10B981]/15"
          : "from-slate-50 to-slate-100 text-[#0F172A] ring-[#E2E8F0]";

  return (
    <article
      className={`rounded-3xl border border-[#E2E8F0] bg-gradient-to-br ${accent} p-5 ring-1 shadow-[0_24px_80px_rgba(37,99,235,0.08)]`}
    >
      <p className="text-sm font-medium text-[#64748B]">{stat.label}</p>
      <div className="mt-3 flex items-end justify-between gap-3">
        <p className="text-2xl font-semibold tracking-tight text-[#0F172A]">
          {stat.value}
        </p>
        <span className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1 text-xs font-semibold text-[#0F172A]">
          {stat.delta}
        </span>
      </div>
    </article>
  );
}

export function Panel({
  title,
  subtitle,
  children,
  className = "",
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[1.75rem] border border-[#E2E8F0] bg-[#FFFFFF] p-5 shadow-[0_24px_80px_rgba(37,99,235,0.06)] ${className}`}
    >
      <div className="mb-5 flex items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-[#0F172A]">{title}</h2>
          {subtitle ? (
            <p className="mt-1 text-sm text-[#64748B]">{subtitle}</p>
          ) : null}
        </div>
      </div>
      {children}
    </section>
  );
}

export function Badge({
  tone = "slate",
  children,
}: {
  tone?: "sky" | "indigo" | "slate" | "rose" | "emerald";
  children: ReactNode;
}) {
  const tones = {
    sky: "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]",
    indigo: "border-[#1D4ED8]/20 bg-[#1D4ED8]/10 text-[#1D4ED8]",
    slate: "border-[#E2E8F0] bg-[#FFFFFF] text-[#64748B]",
    rose: "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#EF4444]",
    emerald: "border-[#10B981]/20 bg-[#10B981]/10 text-[#10B981]",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}
    >
      {children}
    </span>
  );
}

export function ProgressBar({
  value,
  label,
}: {
  value: number;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-[#64748B]">{label}</span>
        <span className="font-semibold text-[#0F172A]">{value}%</span>
      </div>
      <div className="h-2 rounded-full bg-[#E2E8F0]">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-[#2563EB] to-[#1D4ED8]"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}

export function BarChart({ values }: { values: number[] }) {
  return (
    <div className="flex h-48 items-end gap-3 rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-4">
      {values.map((value, index) => (
        <div
          key={`${value}-${index}`}
          className="flex flex-1 flex-col items-center gap-3"
        >
          <div className="relative flex h-full w-full items-end rounded-full bg-[#F8FAFC] p-1">
            <div
              className="w-full rounded-full bg-gradient-to-t from-[#2563EB] to-[#1D4ED8] shadow-[0_0_25px_rgba(37,99,235,0.18)]"
              style={{ height: `${value}%` }}
            />
          </div>
          <span className="text-[11px] uppercase tracking-[0.3em] text-[#64748B]">
            W{index + 1}
          </span>
        </div>
      ))}
    </div>
  );
}

export function SectionList({
  items,
}: {
  items: { title: string; detail: string; time: string }[];
}) {
  return (
    <div className="space-y-4">
      {items.map((item) => (
        <article
          key={`${item.title}-${item.time}`}
          className="rounded-2xl border border-[#E2E8F0] bg-[#FFFFFF] p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <h3 className="font-semibold text-[#0F172A]">{item.title}</h3>
              <p className="mt-1 text-sm leading-6 text-[#64748B]">
                {item.detail}
              </p>
            </div>
            <span className="shrink-0 rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-1 text-xs text-[#64748B]">
              {item.time}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}
