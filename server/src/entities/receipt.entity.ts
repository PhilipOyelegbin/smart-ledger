import { Column, Entity, Index, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { Invoice } from "./invoice.entity";

export enum ReceiptPaymentMethod {
  CASH = "CASH",
  CARD = "CARD",
  BANK_TRANSFER = "BANK_TRANSFER",
  PAYPAL = "PAYPAL",
  OTHER = "OTHER",
}

/**
 * @swagger
 * components:
 *   schemas:
 *     Receipt:
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
 *         invoice:
 *           $ref: '#/components/schemas/Invoice'
 *         receiptNumber:
 *           type: string
 *         amountPaid:
 *           type: string
 *         paymentMethod:
 *           type: string
 *         paymentDate:
 *           type: string
 *           format: date
 */
@Entity("receipts")
@Index(["receiptNumber"], { unique: true })
export class Receipt extends BaseUuidEntity {
  @ManyToOne(() => Invoice, (invoice) => invoice.receipts, {
    onDelete: "CASCADE",
  })
  invoice!: Invoice;

  @Column({ type: "varchar", length: 50 })
  receiptNumber!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  amountPaid!: string;

  @Column({ type: "enum", enum: ReceiptPaymentMethod })
  paymentMethod!: ReceiptPaymentMethod;

  @Column({ type: "date" })
  paymentDate!: string;
}
