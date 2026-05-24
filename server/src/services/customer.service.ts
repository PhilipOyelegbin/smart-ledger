import { AppDataSource } from "../config/data-source";
import { Customer } from "../entities/customer.entity";
import { Business } from "../entities/business.entity";
import { Invoice } from "../entities/invoice.entity";
import { UserRole } from "../entities/user.entity";
import { UpsertCustomerDto } from "../dtos/customer.dto";
import { ForbiddenError, NotFoundError } from "../utils/AppError";
import { getPagination } from "../utils/pagination";

export class CustomerService {
  private readonly customerRepository = AppDataSource.getRepository(Customer);
  private readonly businessRepository = AppDataSource.getRepository(Business);

  async create(userId: string, dto: UpsertCustomerDto, role?: UserRole) {
    const business = await this.resolveBusiness(userId, dto.businessId, role);

    const customer = this.customerRepository.create({
      business,
      name: dto.name.trim(),
      email: dto.email || null,
      phone: dto.phone || null,
      address: dto.address || null,
    });

    return this.customerRepository.save(customer);
  }

  async list(
    userId: string,
    filters: {
      businessId?: string;
      search?: string;
      page?: number;
      limit?: number;
    },
    role?: UserRole,
  ) {
    const pagination = getPagination(filters);
    const query = this.customerRepository
      .createQueryBuilder("customer")
      .leftJoinAndSelect("customer.business", "business")
      .orderBy(`customer.${pagination.sortBy}`, pagination.sortOrder)
      .skip(pagination.skip)
      .take(pagination.limit);

    if (filters.businessId) {
      await this.resolveBusiness(userId, filters.businessId, role);
      query.andWhere("business.id = :businessId", {
        businessId: filters.businessId,
      });
    } else {
      query.andWhere("business.userId = :userId", { userId });
    }

    if (filters.search) {
      query.andWhere(
        "(customer.name ILIKE :search OR customer.email ILIKE :search)",
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

  async getById(userId: string, customerId: string, role?: UserRole) {
    const customer = await this.customerRepository.findOne({
      where: { id: customerId },
      relations: { business: { user: true } },
    });

    if (!customer) {
      throw new NotFoundError("Customer not found");
    }

    if (customer.business.user.id !== userId && role !== UserRole.ADMIN) {
      throw new ForbiddenError("You do not have access to this customer");
    }

    return customer;
  }

  async update(
    userId: string,
    customerId: string,
    dto: Partial<UpsertCustomerDto>,
    role?: UserRole,
  ) {
    const customer = await this.getById(userId, customerId, role);

    if (dto.businessId && dto.businessId !== customer.business.id) {
      customer.business = await this.resolveBusiness(
        userId,
        dto.businessId,
        role,
      );
    }

    Object.assign(customer, {
      name: dto.name?.trim() ?? customer.name,
      email: dto.email ?? customer.email,
      phone: dto.phone ?? customer.phone,
      address: dto.address ?? customer.address,
    });

    return this.customerRepository.save(customer);
  }

  async delete(userId: string, customerId: string, role?: UserRole) {
    const customer = await this.getById(userId, customerId, role);
    await this.customerRepository.remove(customer);
    return { success: true };
  }

  async invoiceHistory(userId: string, customerId: string, role?: UserRole) {
    const customer = await this.getById(userId, customerId, role);
    const invoices = await AppDataSource.getRepository(Invoice).find({
      where: { customer: { id: customer.id } },
      relations: { items: true, receipts: true },
    });
    return invoices;
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
}
