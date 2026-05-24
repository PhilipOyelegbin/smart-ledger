import { Column, Entity, Index, ManyToOne, OneToMany } from "typeorm";
import { BaseUuidEntity } from "./base.entity";
import { Business } from "./business.entity";
import { Invoice } from "./invoice.entity";

/**
 * @swagger
 * components:
 *   schemas:
 *     Customer:
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
 *         name:
 *           type: string
 *         email:
 *           type: string
 *         phone:
 *           type: string
 *         address:
 *           type: string
 */
@Entity("customers")
@Index(["business", "email"])
export class Customer extends BaseUuidEntity {
  @ManyToOne(() => Business, (business) => business.customers, {
    onDelete: "CASCADE",
  })
  business!: Business;

  @Column({ type: "varchar", length: 180 })
  name!: string;

  @Column({ type: "varchar", length: 200, nullable: true })
  email?: string | null;

  @Column({ type: "varchar", length: 40, nullable: true })
  phone?: string | null;

  @Column({ type: "text", nullable: true })
  address?: string | null;

  @OneToMany(() => Invoice, (invoice) => invoice.customer)
  invoices!: Invoice[];
}
