import { ReceiptPaymentMethod } from "../entities/receipt.entity";

export interface CreateReceiptDto {
  invoiceId: string;
  amountPaid: number;
  paymentMethod: ReceiptPaymentMethod;
  paymentDate: string;
}
