import { AppError } from "../utils/AppError";
import { logger } from "../config/logger";
import type { HttpNextFunction } from "../types/http.types";

export const notFoundMiddleware = (
  req: any,
  res: any,
  next: HttpNextFunction,
) => {
  const error = new AppError(
    `Route not found: ${req.method} ${req.originalUrl}`,
    404,
  );
  next(error);
};

export const errorMiddleware = (
  error: Error,
  req: any,
  res: any,
  _next: HttpNextFunction,
) => {
  const isAppError = error instanceof AppError;
  const statusCode = isAppError ? error.statusCode : 500;
  const message = isAppError ? error.message : "Internal server error";

  logger.error({
    message: error.message,
    stack: error.stack,
    method: req.method,
    url: req.originalUrl,
    statusCode,
  });

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && !isAppError
      ? { stack: error.stack }
      : {}),
  });
};
