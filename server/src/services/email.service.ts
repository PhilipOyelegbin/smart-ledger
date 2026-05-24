import * as postmark from "postmark";
import { env } from "../config/env";
import { Business } from "../entities/business.entity";
import { Customer } from "../entities/customer.entity";
import { Invoice } from "../entities/invoice.entity";
import { Receipt } from "../entities/receipt.entity";
import { logger } from "../config/logger";

export class EmailService {
  private readonly client = env.postmarkServerToken
    ? new postmark.ServerClient(env.postmarkServerToken)
    : null;

  private async send(
    subject: string,
    html: string,
    to: string,
    attachments?: Array<{ Name: string; Content: string; ContentType: string }>,
  ) {
    if (!this.client) {
      logger.info("Postmark not configured, skipping email send", {
        subject,
        to,
        attachments: attachments?.length || 0,
      });
      return;
    }

    await this.client.sendEmail({
      From: env.emailFrom,
      To: to,
      Subject: subject,
      HtmlBody: html,
      Attachments: attachments?.map((attachment) => ({
        ...attachment,
        ContentID: null,
      })),
    });
  }

  async sendVerificationEmail(email: string, token: string, name: string) {
    const link = `${env.appUrl}/verify-email?token=${encodeURIComponent(token)}`;
    return this.send(
      "Verify your SmartLedger account",
      this.buildSimpleTemplate(
        "Verify your email",
        name,
        `Click to verify your account: <a href="${link}">Verify email</a>`,
      ),
      email,
    );
  }

  async sendPasswordResetEmail(email: string, token: string, name: string) {
    const link = `${env.appUrl}/reset-password?token=${encodeURIComponent(token)}`;
    return this.send(
      "Reset your SmartLedger password",
      this.buildSimpleTemplate(
        "Reset your password",
        name,
        `Reset using this link: <a href="${link}">${link}</a>`,
      ),
      email,
    );
  }

  async sendInvoiceEmail(input: {
    invoice: Invoice;
    business: Business;
    customer?: Customer | null;
    pdfBuffer?: Buffer;
  }) {
    const attachments = input.pdfBuffer
      ? [
          {
            Name: `${input.invoice.invoiceNumber}.pdf`,
            Content: input.pdfBuffer.toString("base64"),
            ContentType: "application/pdf",
          },
        ]
      : undefined;

    const to = input.customer?.email || input.business.email || "";
    if (!to) {
      return;
    }

    const recipientName = input.customer?.name || input.business.businessName;

    const html = this.buildInvoiceTemplate(
      input.business.businessName,
      recipientName,
      input.invoice.invoiceNumber,
    );
    return this.send(
      `Invoice ${input.invoice.invoiceNumber}`,
      html,
      to,
      attachments,
    );
  }

  async sendReceiptEmail(input: {
    receipt: Receipt;
    invoice: Invoice;
    business: Business;
    customer?: Customer | null;
    pdfBuffer?: Buffer;
  }) {
    const attachments = input.pdfBuffer
      ? [
          {
            Name: `${input.receipt.receiptNumber}.pdf`,
            Content: input.pdfBuffer.toString("base64"),
            ContentType: "application/pdf",
          },
        ]
      : undefined;

    const to = input.customer?.email || input.business.email || "";
    if (!to) {
      return;
    }

    const recipientName = input.customer?.name || input.business.businessName;

    const html = this.buildReceiptTemplate(
      input.business.businessName,
      recipientName,
      input.receipt.receiptNumber,
    );
    return this.send(
      `Receipt ${input.receipt.receiptNumber}`,
      html,
      to,
      attachments,
    );
  }

  private buildSimpleTemplate(title: string, name: string, body: string) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#1f2937;">
        <h1 style="margin-bottom:8px;">${title}</h1>
        <p>Hello ${name},</p>
        <p>${body}</p>
        <p style="margin-top:24px;color:#6b7280;">SmartLedger</p>
      </div>
    `;
  }

  private buildInvoiceTemplate(
    businessName: string,
    customerName: string,
    invoiceNumber: string,
  ) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
        <h1>Invoice ${invoiceNumber}</h1>
        <p>Hi ${customerName},</p>
        <p>${businessName} has sent you an invoice. The PDF is attached.</p>
      </div>
    `;
  }

  private buildReceiptTemplate(
    businessName: string,
    customerName: string,
    receiptNumber: string,
  ) {
    return `
      <div style="font-family:Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;">
        <h1>Receipt ${receiptNumber}</h1>
        <p>Hi ${customerName},</p>
        <p>${businessName} has recorded a payment. The receipt is attached.</p>
      </div>
    `;
  }
}
