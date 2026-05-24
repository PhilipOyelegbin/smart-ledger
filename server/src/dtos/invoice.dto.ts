import { InvoiceStatus } from "../entities/invoice.entity";

export interface InvoiceItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface UpsertInvoiceDto {
  businessId: string;
  customerId?: string;
  issueDate: string;
  dueDate: string;
  subtotal?: number;
  tax?: number;
  total?: number;
  status?: InvoiceStatus;
  notes?: string;
  items: InvoiceItemDto[];
}

export interface InvoiceFilterDto {
  status?: InvoiceStatus;
  search?: string;
  businessId?: string;
  customerId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "ASC" | "DESC";
}
