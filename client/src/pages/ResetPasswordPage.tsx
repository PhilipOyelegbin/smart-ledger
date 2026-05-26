import { useFormik } from "formik";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";

type ResetPasswordValues = {
  password: string;
  confirmPassword: string;
};

const resetPasswordSchema = yup.object({
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords must match")
    .required("Confirm your password"),
});

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const { resetPassword } = useAuthStore((state) => state.actions);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);

  const formik = useFormik<ResetPasswordValues>({
    initialValues: { password: "", confirmPassword: "" },
    validationSchema: resetPasswordSchema,
    onSubmit: async (values, helpers) => {
      if (!token) {
        helpers.setStatus("Reset token is missing from the URL.");
        return;
      }

      try {
        await resetPassword({ token, password: values.password });
        helpers.resetForm();
        navigate("/login", { replace: true });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to reset password",
        );
      }
    },
  });

  return (
    <Panel
      title="Reset password"
      subtitle="Choose a new password for your account"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone="emerald">Secure reset</Badge>
          <Link
            to="/login"
            className="text-sm text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            Back to login
          </Link>
        </div>

        {!token ? (
          <div className="rounded-2xl border border-[#EF4444]/20 bg-[#EF4444]/10 px-4 py-3 text-sm text-[#B91C1C]">
            Reset token missing. Open the link from your email again.
          </div>
        ) : null}

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">New password</span>
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

          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">Confirm new password</span>
            <input
              type="password"
              placeholder="Repeat your new password"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("confirmPassword")}
            />
            {formik.touched.confirmPassword && formik.errors.confirmPassword ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.confirmPassword}
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
            disabled={isLoading || formik.isSubmitting || !token}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading || formik.isSubmitting
              ? "Resetting password..."
              : "Reset password"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
