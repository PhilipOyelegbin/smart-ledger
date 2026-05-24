import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { User } from "./user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     RefreshToken:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           $ref: '#/components/schemas/User'
 *         jti:
 *           type: string
 *         tokenHash:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         revokedAt:
 *           type: string
 *           format: date-time
 *         userAgent:
 *           type: string
 *         ipAddress:
 *           type: string
 */
@Entity("refresh_tokens")
@Index(["tokenHash"])
export class RefreshToken extends BaseUuidEntity {
  @ManyToOne(() => User, (user) => user.refreshTokens, { onDelete: "CASCADE" })
  user!: User;

  @Column({ type: "varchar", length: 100, unique: true })
  jti!: string;

  @Column({ type: "varchar", length: 255 })
  tokenHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  revokedAt?: Date | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent?: string | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string | null;
}
