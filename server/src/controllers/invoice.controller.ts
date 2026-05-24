import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { InvoiceService } from "../services/invoice.service";
import { PdfService } from "../services/pdf.service";
import { EmailService } from "../services/email.service";
import { InvoiceStatus } from "../entities/invoice.entity";
import type { WritableResponse } from "../types/http.types";

export class InvoiceController {
  constructor(
    private readonly invoiceService = new InvoiceService(),
    private readonly pdfService = new PdfService(),
    private readonly emailService = new EmailService(),
  ) {}

  create = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.invoiceService.create(
      req.user!.userId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Invoice created successfully", result, 201);
  });

  list = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.invoiceService.list(
      req.user!.userId,
      req.query as any,
      req.user?.role,
    );
    sendSuccess(res, "Invoices fetched successfully", result, 200);
  });

  getById = asyncHandler(async (req: any, res: WritableResponse) => {
    const invoiceId = String(req.params.id);
    const result = await this.invoiceService.getById(
      req.user!.userId,
      invoiceId,
      req.user?.role,
    );
    sendSuccess(res, "Invoice fetched successfully", result, 200);
  });

  update = asyncHandler(async (req: any, res: WritableResponse) => {
    const invoiceId = String(req.params.id);
    const result = await this.invoiceService.update(
      req.user!.userId,
      invoiceId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Invoice updated successfully", result, 200);
  });

  delete = asyncHandler(async (req: any, res: WritableResponse) => {
    const invoiceId = String(req.params.id);
    const result = await this.invoiceService.delete(
      req.user!.userId,
      invoiceId,
      req.user?.role,
    );
    sendSuccess(res, "Invoice deleted successfully", result, 200);
  });

  pdf = asyncHandler(async (req: any, res: WritableResponse) => {
    const invoiceId = String(req.params.id);
    const invoice = await this.invoiceService.getById(
      req.user!.userId,
      invoiceId,
      req.user?.role,
    );
    const buffer = await this.pdfService.generateInvoicePdf(invoice);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${invoice.invoiceNumber}.pdf"`,
    );
    res.send(buffer);
  });

  send = asyncHandler(async (req: any, res: WritableResponse) => {
    const invoiceId = String(req.params.id);
    const invoice = await this.invoiceService.getById(
      req.user!.userId,
      invoiceId,
      req.user?.role,
    );

    const pdfBuffer = await this.pdfService.generateInvoicePdf(invoice);

    // attempt to send email (no-op if no Postmark configured or no recipient)
    await this.emailService.sendInvoiceEmail({
      invoice,
      business: invoice.business,
      customer: invoice.customer ?? undefined,
      pdfBuffer,
    });

    // mark as SENT
    const updated = await this.invoiceService.update(
      req.user!.userId,
      invoiceId,
      { status: InvoiceStatus.SENT },
      req.user?.role,
    );

    sendSuccess(res, "Invoice sent successfully", updated, 200);
  });
}

export const invoiceController = new InvoiceController();
