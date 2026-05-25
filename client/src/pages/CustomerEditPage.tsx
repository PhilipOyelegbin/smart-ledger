import { useEffect } from "react";
import { useFormik } from "formik";
import { useNavigate, useParams } from "react-router-dom";
import * as yup from "yup";
import { Badge, PageShell, Panel } from "../components/Ui";
import { useCustomerStore } from "../store/customerStore";
import { asRecord } from "../utils/viewData";

type CustomerFormValues = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

const customerSchema = yup.object({
  name: yup
    .string()
    .min(2, "Customer name is required")
    .required("Customer name is required"),
  email: yup
    .string()
    .email("Enter a valid email address")
    .required("Customer email is required"),
  phone: yup.string().required("Phone number is required"),
  address: yup
    .string()
    .min(5, "Enter a full address")
    .required("Address is required"),
});

const emptyCustomer: CustomerFormValues = {
  name: "",
  email: "",
  phone: "",
  address: "",
};

export function CustomerEditPage() {
  const navigate = useNavigate();
  const params = useParams<{ id: string }>();
  const customerId = params.id ?? "";

  const customer = useCustomerStore((state) => state.customer) as Partial<
    CustomerFormValues & { id?: string; business?: { id?: string } }
  >;
  const isLoading = useCustomerStore((state) => state.isLoading);
  const message = useCustomerStore((state) => state.message);
  const error = useCustomerStore((state) => state.error);
  const { getById, update } = useCustomerStore((state) => state.actions);

  useEffect(() => {
    if (customerId) {
      void getById(customerId);
    }
  }, [customerId, getById]);

  const businessId = String(asRecord(customer.business)?.id ?? "");

  const formik = useFormik<CustomerFormValues>({
    initialValues: {
      ...emptyCustomer,
      ...customer,
    },
    enableReinitialize: true,
    validationSchema: customerSchema,
    onSubmit: async (values, helpers) => {
      if (!businessId) {
        helpers.setStatus("This customer is missing a business reference.");
        return;
      }

      try {
        await update(customerId, { businessId, ...values });
        helpers.resetForm({ values });
        navigate("/customers", { replace: true });
      } catch (submitError) {
        helpers.setStatus(
          submitError instanceof Error
            ? submitError.message
            : "Unable to update customer",
        );
      }
    },
  });

  return (
    <PageShell
      eyebrow="Customer editor"
      title="Edit customer details"
      description="Update the customer and return to the customer list."
      action={<Badge tone="sky">Edit mode</Badge>}
    >
      <Panel title="Edit customer" subtitle="Update the selected customer">
        <form className="grid gap-4" onSubmit={formik.handleSubmit}>
          {[
            ["name", "Customer name", "Acme Inc"],
            ["email", "Email", "client@acme.com"],
            ["phone", "Phone", "+1 555 210 9087"],
            ["address", "Address", "48 Market Street, New York"],
          ].map(([field, label, placeholder]) => (
            <label key={field} className="space-y-2 text-sm">
              <span className="text-[#64748B]">{label}</span>
              <input
                type={field === "email" ? "email" : "text"}
                placeholder={placeholder}
                className="w-full rounded-2xl border border-[#E2E8F0] bg-white px-4 py-3 text-[#0F172A] outline-none transition placeholder:text-[#94A3B8] focus:border-[#2563EB]"
                {...formik.getFieldProps(field)}
              />
              {formik.touched[field as keyof CustomerFormValues] &&
              formik.errors[field as keyof CustomerFormValues] ? (
                <span className="text-xs text-[#EF4444]">
                  {formik.errors[field as keyof CustomerFormValues]}
                </span>
              ) : null}
            </label>
          ))}

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={isLoading || formik.isSubmitting || !customerId}
              className="rounded-2xl bg-gradient-to-r from-[#2563EB] to-[#1D4ED8] px-5 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading || formik.isSubmitting
                ? "Saving customer..."
                : "Save changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate("/customers")}
              className="rounded-2xl border border-[#E2E8F0] bg-white px-5 py-3 font-semibold text-[#0F172A] transition hover:border-[#2563EB]/30 hover:bg-[#F8FAFC]"
            >
              Cancel
            </button>
          </div>

          {formik.status || error || message ? (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${error ? "border-[#EF4444]/20 bg-[#EF4444]/10 text-[#B91C1C]" : "border-[#2563EB]/20 bg-[#2563EB]/10 text-[#1D4ED8]"}`}
            >
              {formik.status || error || message}
            </div>
          ) : null}
        </form>
      </Panel>
    </PageShell>
  );
}
