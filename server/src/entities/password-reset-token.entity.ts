import { Column, Entity, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { User } from "./user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     PasswordResetToken:
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
 *         tokenHash:
 *           type: string
 *         expiresAt:
 *           type: string
 *           format: date-time
 *         usedAt:
 *           type: string
 *           format: date-time
 */
@Entity("password_reset_tokens")
export class PasswordResetToken extends BaseUuidEntity {
  @ManyToOne(() => User, (user) => user.passwordResetTokens, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Column({ type: "varchar", length: 255 })
  tokenHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  usedAt?: Date | null;
}
