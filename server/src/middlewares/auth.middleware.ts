import { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticationError, ForbiddenError } from "../utils/AppError";
import { UserRole } from "../entities/user.entity";
import { AuthenticatedUser } from "../types/auth.types";
import { AuthenticatedRequest } from "../types/http.types";

export const authMiddleware = (
  req: AuthenticatedRequest,
  _res: Response,
  next: NextFunction,
) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AuthenticationError("Access token is required"));
  }

  const token = header.slice(7);

  try {
    const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch {
    next(new AuthenticationError("Invalid or expired access token"));
  }
};

export const roleMiddleware = (...roles: UserRole[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AuthenticationError("Access token is required"));
    }

    if (!roles.includes(req.user.role)) {
      return next(
        new ForbiddenError(
          "You do not have permission to access this resource",
        ),
      );
    }

    next();
  };
};
