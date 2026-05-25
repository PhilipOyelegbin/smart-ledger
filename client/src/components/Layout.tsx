import { useEffect } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { navItems } from "../data";
import { useAuthStore } from "../store/authStore";

const baseNavClass =
  "group flex items-center justify-between rounded-2xl border border-[#E2E8F0] px-4 py-3 text-sm transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]";

export function Layout() {
  const navigate = useNavigate();
  const access = useAuthStore((state) => state.access);
  const refresh = useAuthStore((state) => state.refresh);
  const user = useAuthStore(
    (state) => state.user as { name?: string; email?: string; role?: string },
  );
  const isLoading = useAuthStore((state) => state.isLoading);
  const message = useAuthStore((state) => state.message);
  const error = useAuthStore((state) => state.error);
  const { me, logout, clearSession } = useAuthStore((state) => state.actions);

  useEffect(() => {
    if (access) {
      void me().catch(async () => {
        const refreshToken =
          refresh || sessionStorage.getItem("refreshToken") || "";

        if (refreshToken) {
          try {
            await useAuthStore.getState().actions.refreshLogin(refreshToken);
            await me();
            return;
          } catch {
            // fall through to clear the session and redirect
          }
        }

        clearSession();
        navigate("/login", { replace: true });
      });
    }
  }, [access, clearSession, me, navigate]);

  const handleLogout = () => {
    void logout(refresh || sessionStorage.getItem("refreshToken") || "");
  };

  return (
    <div className="min-h-screen bg-radial-soft text-[#0F172A]">
      <div className="mx-auto flex min-h-screen w-full max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[#E2E8F0] bg-[#FFFFFF]/90 px-4 py-4 backdrop-blur-xl lg:min-h-screen lg:w-80 lg:border-r lg:border-b-0 lg:px-6 lg:py-6">
          <div className="flex items-center justify-between lg:block">
            <div className="flex items-center gap-3">
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
            <span className="rounded-full border border-[#2563EB]/20 bg-[#2563EB]/10 px-3 py-1 text-xs font-semibold text-[#1D4ED8] lg:hidden">
              Design only
            </span>
          </div>

          <p className="mt-5 max-w-xs text-sm leading-6 text-[#64748B]">
            An invoice-generation SaaS platform designed to manage the full
            billing lifecycle for small businesses and service teams.
          </p>

          <nav className="mt-6 grid gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={({ isActive }) =>
                  `${baseNavClass} ${isActive ? "border-[#2563EB]/30 bg-[#2563EB]/10 text-[#0F172A] shadow-glow" : "text-[#64748B]"}`
                }
              >
                <span>
                  <span className="block font-medium">{item.label}</span>
                  <span className="mt-0.5 block text-xs text-[#64748B]">
                    {item.hint}
                  </span>
                </span>
                <span className="text-[#64748B] transition group-hover:translate-x-0.5 group-hover:text-[#2563EB]">
                  →
                </span>
              </NavLink>
            ))}
          </nav>

          <div className="mt-20 rounded-3xl border border-[#E2E8F0] bg-[#F8FAFC] p-4 shadow-[0_24px_80px_rgba(37,99,235,0.06)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-[#64748B]">
                  Account
                </p>
                <p className="mt-2 text-sm font-semibold text-[#0F172A]">
                  {user?.name || "Guest user"}
                </p>
                <p className="text-xs text-[#64748B]">
                  {user?.email || "Sign in to sync your workspace"}
                </p>
              </div>
              {access ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                >
                  Sign out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                >
                  Sign in
                </Link>
              )}
            </div>
            {(message || error || isLoading) && (
              <p
                className={`mt-3 text-xs ${error ? "text-[#EF4444]" : "text-[#64748B]/40"}`}
              >
                {isLoading ? "Synchronizing account..." : error || message}
              </p>
            )}
          </div>
        </aside>

        <div className="flex-1">
          <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-[#FFFFFF]/90 px-4 py-4 backdrop-blur-xl lg:px-8">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div>
                <h2 className="mt-1 text-lg font-semibold text-[#0F172A] md:text-xl">
                  Invoice generation, client tracking, and collections in one
                  place
                </h2>
              </div>
            </div>
          </header>

          <main className="px-4 py-6 lg:px-8 lg:py-8">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
