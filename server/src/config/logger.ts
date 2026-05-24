import { createLogger, format, transports } from "winston";
import { env } from "./env";

export const logger = createLogger({
  level: env.logLevel,
  format: format.combine(
    format.timestamp(),
    format.errors({ stack: true }),
    format.json(),
  ),
  defaultMeta: { service: "smart-ledger-api" },
  transports: [new transports.Console()],
});
