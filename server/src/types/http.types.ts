import type { Request } from "express";
import type { AuthenticatedUser } from "./auth.types";

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
  requestId?: string;
}

export interface WritableResponse {
  status: (code: number) => WritableResponse;
  json: (body: unknown) => WritableResponse;
  setHeader: (name: string, value: string) => WritableResponse;
  send: (body: unknown) => WritableResponse;
}
