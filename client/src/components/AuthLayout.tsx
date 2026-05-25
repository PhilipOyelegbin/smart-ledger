import { Outlet } from "react-router-dom";

export function AuthLayout() {
  return (
    <div className="min-h-screen bg-radial-soft text-[#0F172A]">
      <div className="mx-auto grid min-h-screen max-w-[1440px] lg:grid-cols-[1.1fr_0.9fr]">
        <aside className="relative hidden overflow-hidden border-r border-[#E2E8F0] bg-[#FFFFFF]/90 p-8 lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(37,99,235,0.1),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.08),transparent_30%)]" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#1D4ED8] text-white shadow-glow">
              <span className="text-lg font-black">SL</span>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                SmartLedger
              </p>
              <h1 className="text-xl font-semibold text-[#0F172A]">
                Invoice Studio
              </h1>
            </div>
          </div>

          <div className="relative z-10 max-w-xl space-y-6">
            <p className="text-xs uppercase tracking-[0.35em] text-[#2563EB]">
              Product suite
            </p>
            <h2 className="text-4xl font-semibold tracking-tight text-[#0F172A]">
              A professional billing experience that feels calm, precise, and
              ready for teams.
            </h2>

            <div className="grid gap-3 pt-4 sm:grid-cols-3">
              {[
                ["Invoice clarity", "Fast to scan"],
                ["Brand control", "Logo, and bank"],
                ["Client trust", "Structured delivery"],
              ].map(([title, detail]) => (
                <div
                  key={title}
                  className="rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4"
                >
                  <p className="font-semibold text-[#0F172A]">{title}</p>
                  <p className="mt-1 text-xs leading-6 text-[#64748B]">
                    {detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative z-10 flex items-center justify-between text-xs text-[#64748B]">
            <span>Secure login required</span>
          </div>
        </aside>

        <main className="flex items-center justify-center px-4 py-8 sm:px-8 lg:px-12">
          <div className="w-full max-w-lg">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
