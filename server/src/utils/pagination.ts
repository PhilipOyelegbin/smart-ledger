export interface PaginationQuery {
  page?: string | number;
  limit?: string | number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC" | string;
}

export const getPagination = (query: PaginationQuery) => {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 20, 1), 100);
  const sortBy = query.sortBy || "createdAt";
  const sortOrder =
    String(query.sortOrder || "DESC").toUpperCase() === "ASC" ? "ASC" : "DESC";
  const skip = (page - 1) * limit;

  return { page, limit, skip, sortBy, sortOrder } as const;
};
