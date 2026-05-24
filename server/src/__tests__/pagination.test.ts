import { getPagination } from "../utils/pagination";

describe("getPagination", () => {
  it("normalizes pagination inputs", () => {
    const result = getPagination({
      page: "2",
      limit: "50",
      sortBy: "createdAt",
      sortOrder: "ASC",
    });

    expect(result.page).toBe(2);
    expect(result.limit).toBe(50);
    expect(result.skip).toBe(50);
    expect(result.sortOrder).toBe("ASC");
  });
});
