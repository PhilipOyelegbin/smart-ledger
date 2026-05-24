import { Column, Entity, ManyToOne } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { Invoice } from "./invoice.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     InvoiceItem:
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
 *         description:
 *           type: string
 *         quantity:
 *           type: string
 *         unitPrice:
 *           type: string
 *         total:
 *           type: string
 */
@Entity("invoice_items")
export class InvoiceItem extends BaseUuidEntity {
  @ManyToOne(() => Invoice, (invoice) => invoice.items, { onDelete: "CASCADE" })
  invoice!: Invoice;

  @Column({ type: "text" })
  description!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  quantity!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  unitPrice!: string;

  @Column({ type: "numeric", precision: 12, scale: 2 })
  total!: string;
}
