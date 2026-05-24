import { Column, Entity, Index, OneToMany } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { Business } from "./business.entity";
import { RefreshToken } from "./refresh-token.entity";
import { PasswordResetToken } from "./password-reset-token.entity";
import { EmailVerificationToken } from "./email-verification-token.entity";
import { AuditLog } from "./audit-log.entity";

export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         password:
 *           type: string
 *         role:
 *           type: string
 *           enum: [USER, ADMIN]
 *         emailVerified:
 *           type: boolean
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         businesses:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Business'
 *         refreshTokens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/RefreshToken'
 *         passwordResetTokens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/PasswordResetToken'
 *         emailVerificationTokens:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/EmailVerificationToken'
 *         auditLogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditLog'
 */
@Entity("users")
export class User extends BaseUuidEntity {
  @Column({ type: "varchar", length: 160 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: "varchar", length: 200 })
  email!: string;

  @Column({ type: "varchar", length: 255 })
  password!: string;

  @Column({ type: "enum", enum: UserRole, default: UserRole.USER })
  role!: UserRole;

  @Column({ type: "boolean", default: false })
  emailVerified!: boolean;

  @OneToMany(() => Business, (business) => business.user)
  businesses!: Business[];

  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens!: RefreshToken[];

  @OneToMany(() => PasswordResetToken, (token) => token.user)
  passwordResetTokens!: PasswordResetToken[];

  @OneToMany(() => EmailVerificationToken, (token) => token.user)
  emailVerificationTokens!: EmailVerificationToken[];

  @OneToMany(() => AuditLog, (log) => log.user)
  auditLogs!: AuditLog[];
}
