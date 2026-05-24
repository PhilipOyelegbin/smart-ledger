import type {
  HttpNextFunction,
  HttpRequest,
  WritableResponse,
} from "../types/http.types";

export const asyncHandler = (
  fn: (req: any, res: any, next: HttpNextFunction) => Promise<unknown>,
) => {
  return (req: any, res: any, next: HttpNextFunction) => {
    void Promise.resolve(fn(req, res, next)).catch((error) => next(error));
  };
};
