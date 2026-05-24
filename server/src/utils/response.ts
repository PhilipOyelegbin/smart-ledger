import type { WritableResponse } from "../types/http.types";

export const sendSuccess = <T>(
  res: WritableResponse,
  message: string,
  result: T,
  statusCode = 200,
) => {
  return res.status(statusCode).json({
    success: true,
    message,
    result,
  });
};

export const sendError = (
  res: WritableResponse,
  message: string,
  statusCode = 500,
  errors?: unknown,
) => {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
};
