import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "./env";
import { User } from "../entities/user.entity";
import { Business } from "../entities/business.entity";
import { Customer } from "../entities/customer.entity";
import { Invoice } from "../entities/invoice.entity";
import { InvoiceItem } from "../entities/invoice-item.entity";
import { Receipt } from "../entities/receipt.entity";
import { RefreshToken } from "../entities/refresh-token.entity";
import { PasswordResetToken } from "../entities/password-reset-token.entity";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import { AuditLog } from "../entities/audit-log.entity";

export const AppDataSource = new DataSource({
  type: "postgres",
  url: env.databaseUrl,
  synchronize: env.nodeEnv !== "production",
  logging: env.nodeEnv === "development",
  entities: [
    User,
    Business,
    Customer,
    Invoice,
    InvoiceItem,
    Receipt,
    RefreshToken,
    PasswordResetToken,
    EmailVerificationToken,
    AuditLog,
  ],
  migrations: [],
  subscribers: [],
});
