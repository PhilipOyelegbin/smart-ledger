import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { Badge, Panel } from "../components/Ui";
import { authBenefits } from "../data";
import { useAuthStore } from "../store/authStore";

type LoginValues = {
  email: string;
  password: string;
};

const loginSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),
});

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuthStore((state) => state.actions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);

  const formik = useFormik<LoginValues>({
    initialValues: { email: "", password: "" },
    validationSchema: loginSchema,
    onSubmit: async (values, helpers) => {
      try {
        await login(values);
        helpers.resetForm();
        navigate("/dashboard", { replace: true });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to sign in",
        );
      }
    },
  });

  return (
    <Panel
      title="Sign in"
      subtitle=""
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone="sky">Welcome back</Badge>
          <Link
            to="/register"
            className="text-sm text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            Need an account?
          </Link>
        </div>

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">Email address</span>
            <input
              type="email"
              placeholder="you@company.com"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("email")}
            />
            {formik.touched.email && formik.errors.email ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.email}
              </span>
            ) : null}
          </label>

          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">Password</span>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.password}
              </span>
            ) : null}
          </label>

          <div className="flex items-center justify-between text-sm text-[#64748B]">
            <span>Forgot password?</span>
          </div>

          {formik.status || error || message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#B91C1C]" : "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]"}`}
            >
              {formik.status || error || message}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading || formik.isSubmitting ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <div className="grid gap-3 pt-2 sm:grid-cols-2">
          {authBenefits.map((item) => (
            <div
              key={item.title}
              className="rounded-3xl border border-[#E2E8F0] bg-[#FFFFFF] p-4"
            >
              <p className="text-sm font-semibold text-[#0F172A]">
                {item.title}
              </p>
              <p className="mt-1 text-xs leading-6 text-[#64748B]">
                {item.detail}
              </p>
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}
