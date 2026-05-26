import { useFormik } from "formik";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { Badge, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";

type ForgotPasswordValues = {
  email: string;
};

const forgotPasswordSchema = yup.object({
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Email is required"),
});

export function ForgotPasswordPage() {
  const { forgotpassword } = useAuthStore((state) => state.actions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);

  const formik = useFormik<ForgotPasswordValues>({
    initialValues: { email: "" },
    validationSchema: forgotPasswordSchema,
    onSubmit: async (values, helpers) => {
      try {
        await forgotpassword(values.email);
        helpers.resetForm();
        helpers.setStatus("If that email exists, a reset link has been sent.");
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to request password reset",
        );
      }
    },
  });

  return (
    <Panel title="Forgot password" subtitle="Request a reset link by email">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone="sky">Reset access</Badge>
          <Link
            to="/login"
            className="text-sm text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            Back to login
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
              ? "Sending reset link..."
              : "Send reset link"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
