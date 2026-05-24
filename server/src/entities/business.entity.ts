import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { User } from "./user.entity";
import { Customer } from "./customer.entity";
import { Invoice } from "./invoice.entity";
import { AuditLog } from "./audit-log.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Business:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         user:
 *           $ref: '#/components/schemas/User'
 *         businessName:
 *           type: string
 *         logo:
 *           type: string
 *         phone:
 *           type: string
 *         email:
 *           type: string
 *         address:
 *           type: string
 *         taxNumber:
 *           type: string
 *         bankName:
 *           type: string
 *         accountName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         customers:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Customer'
 *         invoices:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Invoice'
 *         auditLogs:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/AuditLog'
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */
@Entity("businesses")
export class Business extends BaseUuidEntity {
  @ManyToOne(() => User, (user) => user.businesses, {
    onDelete: "CASCADE",
    eager: false,
  })
  user!: User;

  @Index()
  @Column({ type: "varchar", length: 180 })
  businessName!: string;

  @Column({ type: "varchar", length: 500, nullable: true })
  logo?: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone?: string | null;

  @Column({ type: "varchar", length: 200, nullable: true })
  email?: string | null;

  @Column({ type: "text", nullable: true })
  address?: string | null;

  @Column({ type: "varchar", length: 100, nullable: true })
  taxNumber?: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  bankName?: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  accountName?: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  accountNumber?: string | null;

  @OneToMany(() => Customer, (customer) => customer.business)
  customers!: Customer[];

  @OneToMany(() => Invoice, (invoice) => invoice.business)
  invoices!: Invoice[];

  @OneToMany(() => AuditLog, (log) => log.business)
  auditLogs!: AuditLog[];
}
