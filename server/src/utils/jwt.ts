import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { env } from "../config/env";
import { AuthenticatedUser, JwtTokenBundle } from "../types/auth.types";

export const signAccessToken = (payload: AuthenticatedUser) => {
  return jwt.sign(payload, env.jwtAccessSecret, {
    expiresIn: env.jwtAccessExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const signRefreshToken = (payload: { userId: string; jti: string }) => {
  return jwt.sign(payload, env.jwtRefreshSecret, {
    expiresIn: env.jwtRefreshExpiresIn as jwt.SignOptions["expiresIn"],
  });
};

export const createTokenJti = () => randomUUID();

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.jwtRefreshSecret) as {
    userId: string;
    jti: string;
    iat: number;
    exp: number;
  };
};

export const buildTokenPair = (payload: AuthenticatedUser): JwtTokenBundle => {
  const jti = createTokenJti();
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken({ userId: payload.userId, jti });

  return { accessToken, refreshToken, jti };
};
