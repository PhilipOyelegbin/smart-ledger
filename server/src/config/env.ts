import dotenv from "dotenv";

dotenv.config();

const required = [
  "DATABASE_URL",
  "SEED_NAME",
  "SEED_EMAIL",
  "SEED_PASSWORD",
  "JWT_ACCESS_SECRET",
  "JWT_REFRESH_SECRET",
  "APP_URL",
  "CORS_ORIGIN",
] as const;

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL as string,
  seedName: process.env.SEED_NAME as string,
  seedEmail: process.env.SEED_EMAIL as string,
  seedPassword: process.env.SEED_PASSWORD as string,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET as string,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET as string,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  emailFrom: process.env.EMAIL_FROM || "SmartLedger <no-reply@smartledger.app>",
  postmarkServerToken: process.env.POSTMARK_SERVER_TOKEN || "",
  appUrl: process.env.APP_URL as string,
  corsOrigin: process.env.CORS_ORIGIN as string,
  rateLimitWindowMs: Number(process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000),
  rateLimitMax: Number(process.env.RATE_LIMIT_MAX || 100),
  logLevel: process.env.LOG_LEVEL || "info",
};
