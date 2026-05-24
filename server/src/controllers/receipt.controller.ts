import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { ReceiptService } from "../services/receipt.service";
import { PdfService } from "../services/pdf.service";
import { EmailService } from "../services/email.service";
import type { WritableResponse } from "../types/http.types";

export class ReceiptController {
  constructor(
    private readonly receiptService = new ReceiptService(),
    private readonly pdfService = new PdfService(),
    private readonly emailService = new EmailService(),
  ) {}

  create = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.receiptService.create(
      req.user!.userId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Receipt created successfully", result, 201);
  });

  list = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.receiptService.list(
      req.user!.userId,
      req.query as any,
      req.user?.role,
    );
    sendSuccess(res, "Receipts fetched successfully", result, 200);
  });

  getById = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.receiptService.getById(
      req.user!.userId,
      String(req.params.id),
      req.user?.role,
    );
    sendSuccess(res, "Receipt fetched successfully", result, 200);
  });

  pdf = asyncHandler(async (req: any, res: WritableResponse) => {
    const receipt = await this.receiptService.getById(
      req.user!.userId,
      String(req.params.id),
      req.user?.role,
    );
    const buffer = await this.pdfService.generateReceiptPdf(
      receipt,
      receipt.invoice,
    );
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${receipt.receiptNumber}.pdf"`,
    );
    res.send(buffer);
  });

  send = asyncHandler(async (req: any, res: WritableResponse) => {
    const receipt = await this.receiptService.getById(
      req.user!.userId,
      String(req.params.id),
      req.user?.role,
    );
    const pdfBuffer = await this.pdfService.generateReceiptPdf(
      receipt,
      receipt.invoice,
    );

    await this.emailService.sendReceiptEmail({
      receipt,
      invoice: receipt.invoice,
      business: receipt.invoice.business,
      customer: receipt.invoice.customer ?? undefined,
      pdfBuffer,
    });

    sendSuccess(res, "Receipt sent successfully", receipt, 200);
  });
}

export const receiptController = new ReceiptController();
