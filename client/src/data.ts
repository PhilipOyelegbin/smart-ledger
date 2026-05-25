export type NavItem = {
  label: string;
  path: string;
  hint: string;
};

export type Stat = {
  label: string;
  value: string;
  delta: string;
  tone: "sky" | "indigo" | "emerald" | "slate";
};

export type InvoiceRow = {
  number: string;
  customer: string;
  status: "Draft" | "Sent" | "Paid" | "Overdue";
  amount: string;
  due: string;
};

export type CustomerRow = {
  name: string;
  company: string;
  plan: string;
  status: "Active" | "Onboarding" | "Paused";
  balance: string;
};

export type ActivityItem = {
  title: string;
  detail: string;
  time: string;
};

export type TimelineStep = {
  title: string;
  detail: string;
  done: boolean;
};

export type AuthBenefit = {
  title: string;
  detail: string;
};

export const authBenefits: AuthBenefit[] = [
  {
    title: "Clean invoicing flow",
    detail: "Create, send, and track invoices from a focused workspace.",
  },
  {
    title: "Built for teams",
    detail:
      "Manage businesses, customers, and reporting with a shared visual system.",
  },
];

export const navItems: NavItem[] = [
  { label: "Dashboard", path: "/", hint: "Snapshot overview" },
  { label: "Business", path: "/business", hint: "Brand profile" },
  { label: "Customers", path: "/customers", hint: "Client roster" },
  { label: "Invoices", path: "/invoices", hint: "Billing pipeline" },
  { label: "Receipts", path: "/receipts", hint: "Payment records" },
];

export const dashboardStats: Stat[] = [
  {
    label: "Revenue this month",
    value: "$84,240",
    delta: "+18.4%",
    tone: "sky",
  },
  {
    label: "Collected invoices",
    value: "142",
    delta: "+12.1%",
    tone: "indigo",
  },
  {
    label: "Outstanding balance",
    value: "$12,480",
    delta: "-7.3%",
    tone: "slate",
  },
  { label: "Active customers", value: "38", delta: "+4 new", tone: "emerald" },
];

export const invoiceRows: InvoiceRow[] = [
  {
    number: "INV-2048",
    customer: "Northstar Studios",
    status: "Sent",
    amount: "$4,200",
    due: "Due in 4 days",
  },
  {
    number: "INV-2047",
    customer: "Harbor Labs",
    status: "Paid",
    amount: "$2,880",
    due: "Settled today",
  },
  {
    number: "INV-2046",
    customer: "Sable & Co",
    status: "Overdue",
    amount: "$8,450",
    due: "Past due 7 days",
  },
  {
    number: "INV-2045",
    customer: "Aster Works",
    status: "Draft",
    amount: "$1,240",
    due: "Awaiting review",
  },
];

export const customerRows: CustomerRow[] = [
  {
    name: "Maya Chen",
    company: "Northstar Studios",
    plan: "Retainer",
    status: "Active",
    balance: "$0",
  },
  {
    name: "Leon Carter",
    company: "Harbor Labs",
    plan: "Project-based",
    status: "Active",
    balance: "$0",
  },
  {
    name: "Ava Johnson",
    company: "Sable & Co",
    plan: "Monthly",
    status: "Onboarding",
    balance: "$8,450",
  },
  {
    name: "Noah Patel",
    company: "Aster Works",
    plan: "Advisory",
    status: "Paused",
    balance: "$1,240",
  },
];

export const activityFeed: ActivityItem[] = [
  {
    title: "Invoice INV-2047 marked paid",
    detail: "Receipt created and emailed to Harbor Labs.",
    time: "12 min ago",
  },
  {
    title: "New customer added",
    detail: "Aster Works was onboarded into the workspace.",
    time: "1 hour ago",
  },
  {
    title: "Brand details updated",
    detail: "Logo, bank details, and invoice footer refreshed.",
    time: "3 hours ago",
  },
  {
    title: "Receipt archive generated",
    detail: "Weekly payment records were updated.",
    time: "Today",
  },
];

export const timelineSteps: TimelineStep[] = [
  {
    title: "Create invoice",
    detail: "Build line items, taxes, and payment details.",
    done: true,
  },
  {
    title: "Send to customer",
    detail: "Review branding and email the invoice PDF.",
    done: true,
  },
  {
    title: "Collect payment",
    detail: "Mark the invoice paid when the receipt is issued.",
    done: false,
  },
  {
    title: "Archive receipt",
    detail: "Keep the paper trail ready for reporting.",
    done: false,
  },
];

export const collectionsChart = [72, 84, 66, 92, 78, 88, 96];
export const pipelineChart = [44, 62, 38, 68, 54, 74, 82];
