import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { AuthenticationError, ForbiddenError } from "../utils/AppError";
import { UserRole } from "../entities/user.entity";
import { AuthenticatedUser } from "../types/auth.types";
import type { HttpNextFunction } from "../types/http.types";

export const authMiddleware = (req: any, _res: any, next: HttpNextFunction) => {
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
  return (req: any, _res: any, next: HttpNextFunction) => {
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
