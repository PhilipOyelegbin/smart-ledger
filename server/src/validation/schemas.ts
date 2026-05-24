import Joi from "joi";
import { InvoiceStatus } from "../entities/invoice.entity";
import { ReceiptPaymentMethod } from "../entities/receipt.entity";

const money = Joi.number().min(0).precision(2);

export const authSchemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(160).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  refresh: Joi.object({
    refreshToken: Joi.string().required(),
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required(),
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
  verifyEmail: Joi.object({
    token: Joi.string().required(),
  }),
};

export const businessSchemas = {
  create: Joi.object({
    businessName: Joi.string().trim().min(2).max(180).required(),
    logo: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    email: Joi.string().email().allow("", null),
    address: Joi.string().allow("", null),
    taxNumber: Joi.string().allow("", null),
    bankName: Joi.string().allow("", null),
    accountName: Joi.string().allow("", null),
    accountNumber: Joi.string().allow("", null),
  }),
  update: Joi.object({
    businessName: Joi.string().trim().min(2).max(180),
    logo: Joi.string().allow("", null),
    phone: Joi.string().allow("", null),
    email: Joi.string().email().allow("", null),
    address: Joi.string().allow("", null),
    taxNumber: Joi.string().allow("", null),
    bankName: Joi.string().allow("", null),
    accountName: Joi.string().allow("", null),
    accountNumber: Joi.string().allow("", null),
  }),
};

export const customerSchemas = {
  create: Joi.object({
    businessId: Joi.string().uuid().required(),
    name: Joi.string().trim().min(2).max(180).required(),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    address: Joi.string().allow("", null),
  }),
  update: Joi.object({
    businessId: Joi.string().uuid(),
    name: Joi.string().trim().min(2).max(180),
    email: Joi.string().email().allow("", null),
    phone: Joi.string().allow("", null),
    address: Joi.string().allow("", null),
  }),
  listQuery: Joi.object({
    businessId: Joi.string().uuid(),
    search: Joi.string().allow("", null),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
  }),
};

const invoiceItemSchema = Joi.object({
  description: Joi.string().trim().min(1).required(),
  quantity: Joi.number().positive().required(),
  unitPrice: money.required(),
});

export const invoiceSchemas = {
  create: Joi.object({
    businessId: Joi.string().uuid().required(),
    customerId: Joi.string().uuid().allow("", null),
    issueDate: Joi.string().isoDate().required(),
    dueDate: Joi.string().isoDate().required(),
    tax: money.default(0),
    status: Joi.string()
      .valid(...Object.values(InvoiceStatus))
      .default(InvoiceStatus.DRAFT),
    notes: Joi.string().allow("", null),
    items: Joi.array().items(invoiceItemSchema).min(1).required(),
  }),
  update: Joi.object({
    businessId: Joi.string().uuid(),
    customerId: Joi.string().uuid().allow("", null),
    issueDate: Joi.string().isoDate(),
    dueDate: Joi.string().isoDate(),
    tax: money,
    status: Joi.string().valid(...Object.values(InvoiceStatus)),
    notes: Joi.string().allow("", null),
    items: Joi.array().items(invoiceItemSchema).min(1),
  }),
  listQuery: Joi.object({
    businessId: Joi.string().uuid(),
    customerId: Joi.string().uuid(),
    status: Joi.string().valid(...Object.values(InvoiceStatus)),
    search: Joi.string().allow("", null),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid("ASC", "DESC"),
  }),
};

export const receiptSchemas = {
  create: Joi.object({
    invoiceId: Joi.string().uuid().required(),
    amountPaid: money.required(),
    paymentMethod: Joi.string()
      .valid(...Object.values(ReceiptPaymentMethod))
      .required(),
    paymentDate: Joi.string().isoDate().required(),
  }),
  listQuery: Joi.object({
    businessId: Joi.string().uuid(),
    search: Joi.string().allow("", null),
    page: Joi.number().integer().min(1),
    limit: Joi.number().integer().min(1).max(100),
    sortBy: Joi.string(),
    sortOrder: Joi.string().valid("ASC", "DESC"),
  }),
};
