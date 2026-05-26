import { useEffect, useMemo } from "react";
import { useFormik } from "formik";
import { Link, useSearchParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, Panel } from "../components/Ui";
import { useAuthStore } from "../store/authStore";

type VerifyEmailValues = {
  token: string;
};

const verifyEmailSchema = yup.object({
  token: yup.string().required("Verification token is required"),
});

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const queryToken = searchParams.get("token") ?? "";
  const queryEmail = searchParams.get("email") ?? "";

  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const message = useAuthStore((state) => state.message);
  const { verifyEmail } = useAuthStore((state) => state.actions);

  const formik = useFormik<VerifyEmailValues>({
    initialValues: { token: queryToken },
    enableReinitialize: true,
    validationSchema: verifyEmailSchema,
    onSubmit: async (values, helpers) => {
      try {
        await verifyEmail(values.token);
        helpers.setStatus(
          "Email verified successfully. You can continue to login.",
        );
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to verify email",
        );
      }
    },
  });

  useEffect(() => {
    if (!queryToken) {
      return;
    }

    void formik.submitForm();
    // submitForm intentionally only depends on query token changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryToken]);

  const statusText = useMemo(() => {
    if (isLoading) return "Verifying token...";
    if (error) return error;
    if (formik.status) return String(formik.status);
    if (message) return message;
    return "Open the email verification link or paste your token below.";
  }, [error, formik.status, isLoading, message]);

  return (
    <Panel
      title="Verify your email"
      subtitle="Activate your SmartLedger account"
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Badge tone="indigo">Account security</Badge>
          <Link
            to="/login"
            className="text-sm text-[#2563EB] transition hover:text-[#1D4ED8]"
          >
            Back to login
          </Link>
        </div>

        {queryEmail ? (
          <p className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
            Verification email sent to:{" "}
            <span className="font-semibold text-[#0F172A]">{queryEmail}</span>
          </p>
        ) : null}

        <form className="space-y-4" onSubmit={formik.handleSubmit}>
          <label className="block space-y-2 text-sm">
            <span className="text-[#64748B]">Verification token</span>
            <input
              type="text"
              placeholder="Paste token from email"
              className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
              {...formik.getFieldProps("token")}
            />
            {formik.touched.token && formik.errors.token ? (
              <span className="text-xs text-[#EF4444]">
                {formik.errors.token}
              </span>
            ) : null}
          </label>

          <div
            className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#B91C1C]" : "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]"}`}
          >
            {statusText}
          </div>

          <button
            type="submit"
            disabled={isLoading || formik.isSubmitting}
            className="w-full rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading || formik.isSubmitting ? "Verifying..." : "Verify email"}
          </button>
        </form>
      </div>
    </Panel>
  );
}
