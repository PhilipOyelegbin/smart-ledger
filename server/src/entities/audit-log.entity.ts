import { Column, Entity, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { User } from "./user.entity";
import { Business } from "./business.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     AuditLog:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         business:
 *           $ref: '#/components/schemas/Business'
 *         action:
 *           type: string
 *         entity:
 *           type: string
 *         entityId:
 *           type: string
 *         metadata:
 *           type: object
 *         ipAddress:
 *           type: string
 *         userAgent:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 */
@Entity("audit_logs")
export class AuditLog extends BaseUuidEntity {
  @ManyToOne(() => User, (user) => user.auditLogs, {
    onDelete: "SET NULL",
    nullable: true,
  })
  user?: User | null;

  @ManyToOne(() => Business, (business) => business.auditLogs, {
    onDelete: "SET NULL",
    nullable: true,
  })
  business?: Business | null;

  @Column({ type: "varchar", length: 100 })
  action!: string;

  @Column({ type: "varchar", length: 100 })
  entity!: string;

  @Column({ type: "varchar", length: 100 })
  entityId!: string;

  @Column({ type: "jsonb", nullable: true })
  metadata?: Record<string, unknown> | null;

  @Column({ type: "varchar", length: 45, nullable: true })
  ipAddress?: string | null;

  @Column({ type: "varchar", length: 255, nullable: true })
  userAgent?: string | null;
}
