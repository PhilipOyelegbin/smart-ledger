import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useBusinessStore } from "../store/businessStore";

type BusinessFormValues = {
  businessName: string;
  logo: string;
  phone: string;
  email: string;
  address: string;
  taxNumber: string;
  bankName: string;
  accountName: string;
  accountNumber: string;
};

const businessSchema = yup.object({
  businessName: yup
    .string()
    .min(2, "Business name is required")
    .required("Business name is required"),
  logo: yup.string().url("Enter a valid URL"),
  phone: yup.string().required("Phone number is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Business email is required"),
  address: yup
    .string()
    .min(5, "Enter a full address")
    .required("Address is required"),
  taxNumber: yup.string().required("Tax number is required"),
  bankName: yup.string().required("Bank name is required"),
  accountName: yup.string().required("Account name is required"),
  accountNumber: yup.string().required("Account number is required"),
});

const emptyBusiness: BusinessFormValues = {
  businessName: "",
  logo: "",
  phone: "",
  email: "",
  address: "",
  taxNumber: "",
  bankName: "",
  accountName: "",
  accountNumber: "",
};

export function BusinessEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const businessId = params.id ?? "";

  const business = useBusinessStore((state) => state.business) as Partial<
    BusinessFormValues & { id?: string }
  >;
  const isLoading = useBusinessStore((state) => state.isLoading);
  const message = useBusinessStore((state) => state.message);
  const error = useBusinessStore((state) => state.error);
  const { get, update } = useBusinessStore((state) => state.actions);

  useEffect(() => {
    if (businessId) {
      void get(businessId);
    }
  }, [businessId, get]);

  const formik = useFormik<BusinessFormValues>({
    initialValues: {
      ...emptyBusiness,
      ...business,
    },
    enableReinitialize: true,
    validationSchema: businessSchema,
    onSubmit: async (values, helpers) => {
      try {
        await update(businessId, values);
        helpers.resetForm({ values });
        navigate("/business", { replace: true });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to update business details",
        );
      }
    },
  });

  return (
    <PageShell
      eyebrow="Business editor"
      title="Edit business details"
      description="Update one business record, then return to the business list."
      action={<Badge tone="sky">Edit mode</Badge>}
    >
      <Panel title="Edit business" subtitle="Update the selected business">
        <form
          className="grid gap-4 md:grid-cols-2"
          onSubmit={formik.handleSubmit}
        >
          {[
            ["businessName", "Business name", "SmartLedger Studio"],
            ["logo", "Logo URL", "https://..."],
            ["phone", "Phone", "+1 555 210 9087"],
            ["email", "Email", "hello@company.com"],
            ["address", "Address", "48 Market Street, New York"],
            ["taxNumber", "Tax number", "TX-203948"],
            ["bankName", "Bank name", "Oceanic Bank"],
            ["accountName", "Account name", "SmartLedger Studio LLC"],
            ["accountNumber", "Account number", "00123456789"],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="space-y-2 text-sm">
              <span className="text-[#64748B]">{label}</span>
              <input
                type={field === "email" ? "email" : "text"}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                {...formik.getFieldProps(field)}
              />
              {formik.touched[field as keyof BusinessFormValues] &&
              formik.errors[field as keyof BusinessFormValues] ? (
                <span className="text-xs text-[#EF4444]">
                  {formik.errors[field as keyof BusinessFormValues]}
                </span>
              ) : null}
            </label>
          ))}

          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting || !businessId}
              className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading || formik.isSubmitting
                ? "Saving business..."
                : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/business")}
              className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
          </div>

          {formik.status || error || message ? (
            <div
              className={`md:col-span-2 rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#B91C1C]" : "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]"}`}
            >
              {formik.status || error || message}
            </div>
          ) : null}
        </form>
      </Panel>
    </PageShell>
  );
}
