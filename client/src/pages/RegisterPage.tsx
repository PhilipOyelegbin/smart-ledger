import { useFormik } from "formik";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { Badge, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";

type RegisterValues = {
  name: string;
  email: string;
  password: string;
};

const registerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Enter your full name")
    .required("Name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
});

export function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuthStore((state) => state.actions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);

  const formik = useFormik<RegisterValues>({
    initialValues: { name: "", email: "", password: "" },
    validationSchema: registerSchema,
    onSubmit: async (values, helpers) => {
      try {
        await register(values);
        helpers.resetForm();
        navigate("/dashboard", { replace: true });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to create account",
        );
      }
    },
  });

  return (
    <Panel
      title="Create your account"
      subtitle=""
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone="indigo">Get started</Badge>
          <Link
            to="/login"
            className="text-sm text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            Already have an account?
          </Link>
        </div>

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">Full name</span>
            <input
              type="text"
              placeholder="Ava Johnson"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("name")}
            />
            {formik.touched.name && formik.errors.name ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.name}
              </span>
            ) : null}
          </label>

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
              placeholder="At least 8 characters"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("password")}
            />
            {formik.touched.password && formik.errors.password ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.password}
              </span>
            ) : null}
          </label>

          {/* <div className="flex items-center gap-2 text-sm text-[#64748B]">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-[#CBD5E1] bg-white"
            />
            <span>I agree to the terms and privacy policy</span>
          </div> */}

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
            {isLoading || formik.isSubmitting
              ? "Creating account..."
              : "Create account"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
