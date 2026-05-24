import { AppDataSource } from "../config/data-source";
import { Business } from "../entities/business.entity";
import { User, UserRole } from "../entities/user.entity";
import { UpsertBusinessDto } from "../dtos/business.dto";
import { ForbiddenError, NotFoundError } from "../utils/AppError";

export class BusinessService {
  private readonly businessRepository = AppDataSource.getRepository(Business);
  private readonly userRepository = AppDataSource.getRepository(User);

  async create(userId: string, dto: UpsertBusinessDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundError("User not found");
    }

    const business = this.businessRepository.create({
      user,
      businessName: dto.businessName.trim(),
      logo: dto.logo || null,
      phone: dto.phone || null,
      email: dto.email || null,
      address: dto.address || null,
      taxNumber: dto.taxNumber || null,
      bankName: dto.bankName || null,
      accountName: dto.accountName || null,
      accountNumber: dto.accountNumber || null,
    });

    return this.businessRepository.save(business);
  }

  async getById(userId: string, businessId: string, role?: UserRole) {
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

  async update(
    userId: string,
    businessId: string,
    dto: Partial<UpsertBusinessDto>,
    role?: UserRole,
  ) {
    const business = await this.getById(userId, businessId, role);

    Object.assign(business, {
      businessName: dto.businessName?.trim() ?? business.businessName,
      logo: dto.logo ?? business.logo,
      phone: dto.phone ?? business.phone,
      email: dto.email ?? business.email,
      address: dto.address ?? business.address,
      taxNumber: dto.taxNumber ?? business.taxNumber,
      bankName: dto.bankName ?? business.bankName,
      accountName: dto.accountName ?? business.accountName,
      accountNumber: dto.accountNumber ?? business.accountNumber,
    });

    return this.businessRepository.save(business);
  }
}
