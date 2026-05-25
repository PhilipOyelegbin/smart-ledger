import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useBusinessStore } from "../store/businessStore";
import { asRecord, toArray } from "../utils/viewData";

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

export function BusinessPage() {
  const navigate = useNavigate();
  const businesses = useBusinessStore((state) => state.businesses);
  const isLoading = useBusinessStore((state) => state.isLoading);
  const message = useBusinessStore((state) => state.message);
  const error = useBusinessStore((state) => state.error);
  const { create, deleteById, getAll } = useBusinessStore(
    (state) => state.actions,
  );

  const businessRows = toArray<Record<string, unknown>>(businesses);

  useEffect(() => {
    void getAll();
  }, [getAll]);

  const formik = useFormik<BusinessFormValues>({
    initialValues: emptyBusiness,
    enableReinitialize: true,
    validationSchema: businessSchema,
    onSubmit: async (values, helpers) => {
      try {
        await create(values);
        await getAll();
        helpers.resetForm({ values });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to save business details",
        );
      }
    },
  });

  return (
    <PageShell
      eyebrow="Business profile"
      title="Manage your businesses"
      description="Create a new business here, then edit or delete any existing business from the list."
      action={<Badge tone="indigo">Workspace setup</Badge>}
    >
      <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Panel
          title="Your businesses"
          subtitle="All businesses attached to the logged-in user"
        >
          {isLoading ? (
            <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-3 text-sm text-[#64748B]">
              Loading businesses...
            </div>
          ) : null}

          <div className="space-y-3">
            {businessRows.map((item, index) => {
              const row = asRecord(item);
              const rowId = String(row?.id ?? index);

              return (
                <div
                  key={rowId}
                  className="rounded-3xl border border-[#E2E8F0] bg-white p-4 transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-semibold text-[#0F172A]">
                        {String(row?.businessName ?? "Business")}
                      </h3>
                      <p className="mt-1 text-sm text-[#64748B]">
                        {String(
                          row?.email ?? row?.phone ?? "No contact details",
                        )}
                      </p>
                    </div>
                    <Badge tone="slate">Business</Badge>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <p className="text-[#64748B]">Tax</p>
                      <p className="mt-1 font-semibold text-[#0F172A]">
                        {String(row?.taxNumber ?? "—")}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] p-3">
                      <p className="text-[#64748B]">Bank</p>
                      <p className="mt-1 font-semibold text-[#0F172A]">
                        {String(row?.bankName ?? "—")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/businesses/${rowId}/edit`)}
                      className="rounded-full border border-[#E2E8F0] bg-white px-3 py-1.5 text-xs font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        void (async () => {
                          await deleteById(rowId);
                          await getAll();
                        })();
                      }}
                      className="rounded-full border border-[#EF4444]/20 bg-[#EF4444]/10 px-3 py-1.5 text-xs font-semibold text-[#B91C1C] transition hover:bg-[#EF4444]/20"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              );
            })}

            {!businessRows.length ? (
              <div className="rounded-2xl border border-dashed border-[#CBD5E1] px-4 py-6 text-sm text-[#64748B]">
                No businesses found yet. Create one using the form.
              </div>
            ) : null}
          </div>
        </Panel>

        <Panel
          title="Business profile form"
          subtitle="Fill in the details for the new business"
        >
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
                disabled={isLoading || formik.isSubmitting}
                className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading || formik.isSubmitting
                  ? "Saving business..."
                  : "Create business"}
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
      </div>
    </PageShell>
  );
}
