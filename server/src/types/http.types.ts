import type { AuthenticatedUser } from "./auth.types";

export interface HttpRequest {
  body: any;
  query: any;
  params: Record<string, string>;
  headers: Record<string, string | undefined>;
  ip: string;
  method: string;
  originalUrl: string;
  header: (name: string) => string | undefined;
  user?: AuthenticatedUser;
  requestId?: string;
}

export interface AuthenticatedRequest extends HttpRequest {
  user?: AuthenticatedUser;
}

export interface WritableResponse {
  status: (code: number) => WritableResponse;
  json: (body: unknown) => WritableResponse;
  setHeader: (name: string, value: string) => WritableResponse;
  send: (body: unknown) => WritableResponse;
}

export type HttpNextFunction = (error?: unknown) => void;
