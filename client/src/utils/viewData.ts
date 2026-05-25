export function asRecord(value: unknown) {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

export function toArray<T>(value: unknown): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  const record = asRecord(value);
  if (!record) {
    return [];
  }

  for (const key of ["data", "items", "results", "recentInvoices"]) {
    const candidate = record[key];
    if (Array.isArray(candidate)) {
      return candidate as T[];
    }
  }

  return [];
}

export function formatMoney(value: unknown) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(Number.isFinite(amount) ? amount : 0);
}

export function formatDate(value: unknown) {
  if (!value) {
    return "—";
  }

  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) {
    return String(value);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function getPrimaryBusinessId(...sources: unknown[]) {
  for (const source of sources) {
    const record = asRecord(source);
    if (!record) continue;

    if (typeof record.id === "string" && record.id) return record.id;
    if (typeof record.businessId === "string" && record.businessId)
      return record.businessId;

    const businesses = record.businesses;
    if (Array.isArray(businesses) && businesses.length > 0) {
      const firstBusiness = asRecord(businesses[0]);
      const fb: any = firstBusiness as any;
      const businessId = fb?.id ?? fb?.businessId ?? fb?.business?.id;
      if (typeof businessId === "string" && businessId) return businessId;
    }

    const business = asRecord(record.business);
    const businessRecord = asRecord(business);
    const br: any = businessRecord as any;
    const nestedBusinessId = br?.id ?? br?.businessId ?? br?.business?.id;
    if (typeof nestedBusinessId === "string" && nestedBusinessId)
      return nestedBusinessId;
  }

  return "";
}
