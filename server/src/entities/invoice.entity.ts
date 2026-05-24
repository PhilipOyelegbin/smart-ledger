import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { Business } from "./business.entity";
import { Customer } from "./customer.entity";
import { InvoiceItem } from "./invoice-item.entity";
import { Receipt } from "./receipt.entity";

export enum InvoiceStatus {
  DRAFT = "DRAFT",
  SENT = "SENT",
  PAID = "PAID",
  OVERDUE = "OVERDUE",
  CANCELLED = "CANCELLED",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Invoice:
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
 *         business:
 *           $ref: '#/components/schemas/Business'
 *         customer:
 *           $ref: '#/components/schemas/Customer'
 *         invoiceNumber:
 *           type: string
 *         issueDate:
 *           type: string
 *           format: date-time
 *         dueDate:
 *           type: string
 *           format: date-time
 *         subtotal:
 *           type: string
 *         tax:
 *           type: string
 *         total:
 *           type: string
 *         bankName:
 *           type: string
 *         accountName:
 *           type: string
 *         accountNumber:
 *           type: string
 *         status:
 *           type: string
 *         notes:
 *           type: string
 */
@Entity("invoices")
@Index(["business", "invoiceNumber"], { unique: true })
@Index(["status"])
@Index(["issueDate"])
@Index(["dueDate"])
export class Invoice extends BaseUuidEntity {
  @ManyToOne(() => Business, (business) => business.invoices, {
    onDelete: "CASCADE",
  })
  business!: Business;

  @ManyToOne(() => Customer, (customer) => customer.invoices, {
    onDelete: "SET NULL",
    nullable: true,
    eager: true,
  })
  customer?: Customer | null;

  @Column({ type: "varchar", length: 50 })
  invoiceNumber!: string;

  @Column({ type: "date" })
  issueDate!: string;

  @Column({ type: "date" })
  dueDate!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  subtotal!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  tax!: string;

  @Column({ type: "numeric", precision: 12, scale: 2, default: 0 })
  total!: string;

  @Column({ type: "varchar", length: 180, nullable: true })
  bankName?: string | null;

  @Column({ type: "varchar", length: 180, nullable: true })
  accountName?: string | null;

  @Column({ type: "varchar", length: 80, nullable: true })
  accountNumber?: string | null;

  @Column({ type: "enum", enum: InvoiceStatus, default: InvoiceStatus.DRAFT })
  status!: InvoiceStatus;

  @Column({ type: "text", nullable: true })
  notes?: string | null;

  @OneToMany(() => InvoiceItem, (item) => item.invoice, {
    cascade: true,
    eager: true,
    orphanedRowAction: "delete",
  })
  items!: InvoiceItem[];

  @OneToMany(() => Receipt, (receipt) => receipt.invoice)
  receipts!: Receipt[];
}
