import PDFDocument from "pdfkit";
import { Business } from "../entities/business.entity";
import { Customer } from "../entities/customer.entity";
import { Invoice } from "../entities/invoice.entity";
import { Receipt } from "../entities/receipt.entity";
import { toNumber } from "../utils/number";

export class PdfService {
  async generateInvoicePdf(invoice: Invoice): Promise<Buffer> {
    return this.generateDocument((doc) => {
      this.renderInvoice(doc, invoice);
    });
  }

  async generateReceiptPdf(
    receipt: Receipt,
    invoice: Invoice,
  ): Promise<Buffer> {
    return this.generateDocument((doc) => {
      this.renderReceipt(doc, receipt, invoice);
    });
  }

  private async generateDocument(
    renderer: (doc: PDFKit.PDFDocument) => void,
  ): Promise<Buffer> {
    return new Promise<Buffer>((resolve) => {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ margin: 40, size: "A4" });
      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      renderer(doc);
      doc.end();
    });
  }

  private renderInvoice(doc: PDFKit.PDFDocument, invoice: Invoice) {
    const business = invoice.business as Business;
    const customer = invoice.customer as Customer | null;
    this.renderHeader(
      doc,
      business.businessName,
      invoice.invoiceNumber,
      "Invoice",
    );
    this.renderBusinessBlock(doc, business);
    this.renderInvoicePaymentBlock(doc, invoice);
    this.renderCustomerBlock(doc, customer);
    this.renderItemsTable(doc, invoice);
    this.renderTotals(doc, invoice);
    this.renderFooter(doc, "Thank you for your business.");
  }

  private renderReceipt(
    doc: PDFKit.PDFDocument,
    receipt: Receipt,
    invoice: Invoice,
  ) {
    const business = invoice.business as Business;
    const customer = invoice.customer as Customer | null;
    this.renderHeader(
      doc,
      business.businessName,
      receipt.receiptNumber,
      "Receipt",
    );
    this.renderBusinessBlock(doc, business);
    this.renderCustomerBlock(doc, customer);
    doc.moveDown();
    doc.fontSize(11).text(`Invoice Number: ${invoice.invoiceNumber}`);
    doc.text(`Payment Date: ${receipt.paymentDate}`);
    doc.text(`Payment Method: ${receipt.paymentMethod}`);
    doc.text(`Amount Paid: ${toNumber(receipt.amountPaid).toFixed(2)}`);
    this.renderFooter(doc, "Payment received successfully.");
  }

  private renderHeader(
    doc: PDFKit.PDFDocument,
    businessName: string,
    documentNumber: string,
    documentType: string,
  ) {
    doc
      .fontSize(22)
      .fillColor("#111827")
      .text(documentType, { align: "right" });
    doc.moveDown(0.5);
    doc.fontSize(28).fillColor("#0f172a").text(businessName, { align: "left" });
    doc.moveDown(0.2);
    doc
      .fontSize(12)
      .fillColor("#475569")
      .text(`${documentType} Number: ${documentNumber}`, { align: "left" });
    doc.moveDown();
  }

  private renderBusinessBlock(doc: PDFKit.PDFDocument, business: Business) {
    doc.fontSize(12).fillColor("#111827").text("Business Details");
    doc.fontSize(10).fillColor("#334155").text(business.businessName);
    if (business.email) doc.text(business.email);
    if (business.phone) doc.text(business.phone);
    if (business.address) doc.text(business.address);
    if (business.taxNumber) doc.text(`Tax No: ${business.taxNumber}`);
    doc.moveDown();
  }

  private renderInvoicePaymentBlock(doc: PDFKit.PDFDocument, invoice: Invoice) {
    if (!invoice.bankName && !invoice.accountName && !invoice.accountNumber) {
      return;
    }

    doc.fontSize(12).fillColor("#111827").text("Payment Details");
    doc.fontSize(10).fillColor("#334155");
    if (invoice.bankName) doc.text(`Bank: ${invoice.bankName}`);
    if (invoice.accountName) doc.text(`Account Name: ${invoice.accountName}`);
    if (invoice.accountNumber)
      doc.text(`Account Number: ${invoice.accountNumber}`);
    doc.moveDown();
  }

  private renderCustomerBlock(
    doc: PDFKit.PDFDocument,
    customer: Customer | null,
  ) {
    doc.fontSize(12).fillColor("#111827").text("Customer Details");
    if (!customer) {
      doc.fontSize(10).fillColor("#334155").text("No customer linked");
      doc.moveDown();
      return;
    }

    doc.fontSize(10).fillColor("#334155").text(customer.name);
    if (customer.email) doc.text(customer.email);
    if (customer.phone) doc.text(customer.phone);
    if (customer.address) doc.text(customer.address);
    doc.moveDown();
  }

  private renderItemsTable(doc: PDFKit.PDFDocument, invoice: Invoice) {
    const startY = doc.y;
    const columns = [40, 240, 330, 400, 470];
    const headers = ["Description", "Qty", "Unit Price", "Total"];

    doc.fontSize(12).fillColor("#111827").text("Invoice Items");
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor("#0f172a");
    headers.forEach((header, index) =>
      doc.text(header, columns[index], startY + 18, { width: 90 }),
    );

    let rowY = startY + 36;
    invoice.items.forEach((item) => {
      doc.text(item.description, columns[0], rowY, { width: 180 });
      doc.text(String(item.quantity), columns[1], rowY, { width: 70 });
      doc.text(Number(item.unitPrice).toFixed(2), columns[2], rowY, {
        width: 70,
      });
      doc.text(Number(item.total).toFixed(2), columns[3], rowY, { width: 70 });
      rowY += 20;
    });
    doc.moveDown(2);
  }

  private renderTotals(doc: PDFKit.PDFDocument, invoice: Invoice) {
    doc
      .fontSize(11)
      .fillColor("#111827")
      .text(`Subtotal: ${toNumber(invoice.subtotal).toFixed(2)}`, {
        align: "right",
      });
    doc.text(`Tax: ${toNumber(invoice.tax).toFixed(2)}`, { align: "right" });
    doc.text(`Total: ${toNumber(invoice.total).toFixed(2)}`, {
      align: "right",
    });
    doc.moveDown();
    if (invoice.notes) {
      doc.fontSize(10).fillColor("#334155").text(`Notes: ${invoice.notes}`);
    }
  }

  private renderFooter(doc: PDFKit.PDFDocument, note: string) {
    doc.moveDown(2);
    doc.fontSize(11).fillColor("#334155").text(note);
    doc.moveDown(2);
    doc.text("Signature: __________________________", { align: "left" });
  }
}
