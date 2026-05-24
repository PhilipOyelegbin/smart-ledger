import { randomUUID } from "crypto";
import type { HttpNextFunction } from "../types/http.types";

export const requestIdMiddleware = (
  req: any,
  res: any,
  next: HttpNextFunction,
) => {
  const requestId = req.header("x-request-id") || randomUUID();
  res.setHeader("x-request-id", requestId);
  req.headers["x-request-id"] = requestId;
  next();
};
