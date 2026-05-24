import { AppDataSource } from "../config/data-source";
import { Receipt } from "../entities/receipt.entity";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { Business } from "../entities/business.entity";
import { UserRole } from "../entities/user.entity";
import { CreateReceiptDto } from "../dtos/receipt.dto";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination } from "../utils/pagination";
import { randomUUID } from "crypto";

export class ReceiptService {
  private readonly receiptRepository = AppDataSource.getRepository(Receipt);
  private readonly invoiceRepository = AppDataSource.getRepository(Invoice);
  private readonly businessRepository = AppDataSource.getRepository(Business);

  async create(userId: string, dto: CreateReceiptDto, role?: UserRole) {
    const invoice = await this.resolveInvoice(userId, dto.invoiceId, role);
    const receipt = this.receiptRepository.create({
      invoice,
      receiptNumber: this.generateReceiptNumber(),
      amountPaid: Number(dto.amountPaid).toFixed(2),
      paymentMethod: dto.paymentMethod,
      paymentDate: dto.paymentDate,
    });

    const savedReceipt = await this.receiptRepository.save(receipt);
    invoice.status = InvoiceStatus.PAID;
    await this.invoiceRepository.save(invoice);

    return savedReceipt;
  }

  async list(
    userId: string,
    filters: {
      businessId?: string;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    },
    role?: UserRole,
  ) {
    const pagination = getPagination(filters);
    const query = this.receiptRepository
      .createQueryBuilder("receipt")
      .leftJoinAndSelect("receipt.invoice", "invoice")
      .leftJoinAndSelect("invoice.business", "business")
      .leftJoinAndSelect("invoice.customer", "customer")
      .leftJoinAndSelect("invoice.items", "items")
      .orderBy(`receipt.${pagination.sortBy}`, pagination.sortOrder)
      .skip(pagination.skip)
      .take(pagination.limit);

    if (filters.businessId) {
      await this.resolveBusiness(userId, filters.businessId, role);
      query.andWhere("business.id = :businessId", {
        businessId: filters.businessId,
      });
    } else if (role !== UserRole.ADMIN) {
      query.andWhere("business.userId = :userId", { userId });
    }

    if (filters.search) {
      query.andWhere(
        "(receipt.receiptNumber ILIKE :search OR invoice.invoiceNumber ILIKE :search OR customer.name ILIKE :search)",
        {
          search: `%${filters.search}%`,
        },
      );
    }

    const [data, total] = await query.getManyAndCount();
    return {
      data,
      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async getById(userId: string, receiptId: string, role?: UserRole) {
    const receipt = await this.receiptRepository.findOne({
      where: { id: receiptId },
      relations: {
        invoice: {
          business: { user: true },
          customer: true,
          items: true,
        },
      },
    });

    if (!receipt) {
      throw new NotFoundError("Receipt not found");
    }

    if (
      receipt.invoice.business.user.id !== userId &&
      role !== UserRole.ADMIN
    ) {
      throw new ForbiddenError("You do not have access to this receipt");
    }

    return receipt;
  }

  async getPdfContext(userId: string, receiptId: string, role?: UserRole) {
    return this.getById(userId, receiptId, role);
  }

  private async resolveInvoice(
    userId: string,
    invoiceId: string,
    role?: UserRole,
  ) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: {
        business: { user: true },
        customer: true,
        items: true,
      },
    });
    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }
    if (invoice.business.user.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenError("You do not have access to this invoice");
    }
    return invoice;
  }

  private async resolveBusiness(
    userId: string,
    businessId: string,
    role?: UserRole,
  ) {
    const business = await this.businessRepository.findOne({
      where: { id: businessId },
      relations: { user: true },
    });

    if (!business) {
      throw new NotFoundError("Business not found");
    }

    if (business.user.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenError("You do not have access to this business");
    }

    return business;
  }

  private generateReceiptNumber() {
    return `RCPT-${new Date().getFullYear()}-${randomUUID().slice(0, 8).toUpperCase()}`;
  }
}
