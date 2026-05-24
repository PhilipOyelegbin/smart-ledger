import { Column, Entity, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { User } from "./user.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     EmailVerificationToken:
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
 *         verifiedAt:
 *           type: string
 *           format: date-time
 */
@Entity("email_verification_tokens")
export class EmailVerificationToken extends BaseUuidEntity {
  @ManyToOne(() => User, (user) => user.emailVerificationTokens, {
    onDelete: "CASCADE",
  })
  user!: User;

  @Column({ type: "varchar", length: 255 })
  tokenHash!: string;

  @Column({ type: "timestamptz" })
  expiresAt!: Date;

  @Column({ type: "timestamptz", nullable: true })
  verifiedAt?: Date | null;
}
