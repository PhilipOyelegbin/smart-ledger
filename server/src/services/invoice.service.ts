import { AppDataSource } from "../config/data-source";
import { Business } from "../entities/business.entity";
import { Customer } from "../entities/customer.entity";
import { Invoice, InvoiceStatus } from "../entities/invoice.entity";
import { InvoiceItem } from "../entities/invoice-item.entity";
import { UserRole } from "../entities/user.entity";
import { UpsertInvoiceDto } from "../dtos/invoice.dto";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination } from "../utils/pagination";
import { toNumber } from "../utils/number";
import { randomUUID } from "crypto";

export class InvoiceService {
  private readonly invoiceRepository = AppDataSource.getRepository(Invoice);
  private readonly businessRepository = AppDataSource.getRepository(Business);
  private readonly customerRepository = AppDataSource.getRepository(Customer);

  async create(userId: string, dto: UpsertInvoiceDto, role?: UserRole) {
    const business = await this.resolveBusiness(userId, dto.businessId, role);
    const customer = dto.customerId
      ? await this.resolveCustomer(userId, dto.customerId, business.id, role)
      : null;
    const items = this.buildItems(dto.items);
    const subtotal = this.calculateSubtotal(items);
    const rawTax = toNumber(dto.tax ?? 0);
    // tax is always treated as a percentage of the subtotal
    const tax = +(subtotal * (rawTax / 100));
    const total = subtotal + tax;

    const invoice = this.invoiceRepository.create({
      business,
      customer,
      invoiceNumber: this.generateInvoiceNumber(),
      issueDate: dto.issueDate,
      dueDate: dto.dueDate,
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
      bankName: business.bankName,
      accountName: business.accountName,
      accountNumber: business.accountNumber,
      status: dto.status || InvoiceStatus.DRAFT,
      notes: dto.notes || null,
      items,
    });

    const saved = await this.invoiceRepository.save(invoice);
    return this.getById(userId, saved.id, role);
  }

  async update(
    userId: string,
    invoiceId: string,
    dto: Partial<UpsertInvoiceDto>,
    role?: UserRole,
  ) {
    const invoice = await this.getById(userId, invoiceId, role);

    if (dto.businessId && dto.businessId !== invoice.business.id) {
      invoice.business = await this.resolveBusiness(
        userId,
        dto.businessId,
        role,
      );
    }

    if (dto.customerId) {
      invoice.customer = await this.resolveCustomer(
        userId,
        dto.customerId,
        invoice.business.id,
        role,
      );
    }

    if (dto.businessId) {
      invoice.bankName = invoice.business.bankName;
      invoice.accountName = invoice.business.accountName;
      invoice.accountNumber = invoice.business.accountNumber;
    }

    if (dto.items) {
      invoice.items = this.buildItems(dto.items);
    }

    invoice.issueDate = dto.issueDate || invoice.issueDate;
    invoice.dueDate = dto.dueDate || invoice.dueDate;
    invoice.notes = dto.notes ?? invoice.notes;
    invoice.status = dto.status || invoice.status;

    const subtotal = dto.items
      ? this.calculateSubtotal(invoice.items)
      : toNumber(invoice.subtotal);

    const rawTax =
      dto.tax !== undefined ? toNumber(dto.tax) : toNumber(invoice.tax);
    // tax is always percentage
    const tax = +(subtotal * (rawTax / 100));

    const total =
      dto.items || dto.tax !== undefined
        ? subtotal + tax
        : toNumber(invoice.total);

    invoice.subtotal = subtotal.toFixed(2);
    invoice.tax = tax.toFixed(2);
    invoice.total = total.toFixed(2);

    await this.invoiceRepository.save(invoice);
    return this.getById(userId, invoiceId, role);
  }

  async delete(userId: string, invoiceId: string, role?: UserRole) {
    const invoice = await this.getById(userId, invoiceId, role);
    await this.invoiceRepository.remove(invoice);
    return { success: true };
  }

  async getById(userId: string, invoiceId: string, role?: UserRole) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: {
        business: { user: true },
        customer: true,
        items: true,
        receipts: true,
      },
    });

    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    if (invoice.business.user.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenError("You do not have access to this invoice");
    }

    await this.reconcileInvoiceStatus(invoice);
    return invoice;
  }

  async list(
    userId: string,
    filters: {
      businessId?: string;
      customerId?: string;
      status?: InvoiceStatus;
      search?: string;
      page?: number;
      limit?: number;
      sortBy?: string;
      sortOrder?: "ASC" | "DESC";
    },
    role?: UserRole,
  ) {
    const pagination = getPagination(filters);
    const query = this.invoiceRepository
      .createQueryBuilder("invoice")
      .leftJoinAndSelect("invoice.business", "business")
      .leftJoinAndSelect("invoice.customer", "customer")
      .leftJoinAndSelect("invoice.items", "items")
      .leftJoinAndSelect("invoice.receipts", "receipts")
      .orderBy(`invoice.${pagination.sortBy}`, pagination.sortOrder)
      .skip(pagination.skip)
      .take(pagination.limit)
      .where("business.userId = :userId", { userId });

    if (role === UserRole.ADMIN && filters.businessId) {
      query.andWhere("business.id = :businessId", {
        businessId: filters.businessId,
      });
    } else if (filters.businessId) {
      await this.resolveBusiness(userId, filters.businessId, role);
      query.andWhere("business.id = :businessId", {
        businessId: filters.businessId,
      });
    }

    if (filters.customerId) {
      query.andWhere("customer.id = :customerId", {
        customerId: filters.customerId,
      });
    }

    if (filters.status) {
      query.andWhere("invoice.status = :status", { status: filters.status });
    }

    if (filters.search) {
      query.andWhere(
        "(invoice.invoiceNumber ILIKE :search OR customer.name ILIKE :search)",
        {
          search: `%${filters.search}%`,
        },
      );
    }

    const [data, total] = await query.getManyAndCount();
    await Promise.all(
      data.map((invoice) => this.reconcileInvoiceStatus(invoice)),
    );

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

  async outstandingBalance(invoiceId: string) {
    const invoice = await this.invoiceRepository.findOne({
      where: { id: invoiceId },
      relations: { receipts: true },
    });
    if (!invoice) {
      throw new NotFoundError("Invoice not found");
    }

    const paid = invoice.receipts.reduce(
      (total, receipt) => total + toNumber(receipt.amountPaid),
      0,
    );
    return Math.max(toNumber(invoice.total) - paid, 0);
  }

  async invoiceNumberExists(invoiceNumber: string) {
    return this.invoiceRepository.exist({ where: { invoiceNumber } });
  }

  private buildItems(items: UpsertInvoiceDto["items"]) {
    return items.map((item) => {
      const quantity = toNumber(item.quantity);
      const unitPrice = toNumber(item.unitPrice);
      const entity = new InvoiceItem();
      entity.description = item.description;
      entity.quantity = quantity.toFixed(2);
      entity.unitPrice = unitPrice.toFixed(2);
      entity.total = (quantity * unitPrice).toFixed(2);
      return entity;
    });
  }

  private calculateSubtotal(items: InvoiceItem[]) {
    return items.reduce((total, item) => total + toNumber(item.total), 0);
  }

  private generateInvoiceNumber() {
    const suffix = randomUUID().slice(0, 8).toUpperCase();
    return `INV-${new Date().getFullYear()}-${suffix}`;
  }

  private async reconcileInvoiceStatus(invoice: Invoice) {
    if (
      invoice.status === InvoiceStatus.CANCELLED ||
      invoice.status === InvoiceStatus.PAID
    ) {
      return invoice;
    }

    const paid =
      invoice.receipts?.reduce(
        (total, receipt) => total + toNumber(receipt.amountPaid),
        0,
      ) || 0;

    if (paid >= toNumber(invoice.total)) {
      invoice.status = InvoiceStatus.PAID;
      await this.invoiceRepository.save(invoice);
      return invoice;
    }

    const overdue = new Date(invoice.dueDate).getTime() < Date.now();
    if (overdue) {
      invoice.status = InvoiceStatus.OVERDUE;
      await this.invoiceRepository.save(invoice);
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

  private async resolveCustomer(
    userId: string,
    customerId: string,
    businessId: string,
    role?: UserRole,
  ) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: { business: { user: true } },
    });
    if (!customer) {
      throw new NotFoundError("Customer not found");
    }
    if (
      customer.business.id !== businessId ||
      (customer.business.user.id !== userId && role !== UserRole.ADMIN)
    ) {
      throw new ForbiddenError("You do not have access to this customer");
    }
    return customer;
  }
}
