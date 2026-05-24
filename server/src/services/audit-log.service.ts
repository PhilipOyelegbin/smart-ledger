import { AppDataSource } from "../config/data-source";
import { AuditLog } from "../entities/audit-log.entity";
import { Business } from "../entities/business.entity";
import { User } from "../entities/user.entity";

interface CreateAuditLogInput {
  user?: User | null;
  business?: Business | null;
  action: string;
  entity: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditLogService {
  private readonly auditLogRepository = AppDataSource.getRepository(AuditLog);

  async create(input: CreateAuditLogInput) {
    const entry = this.auditLogRepository.create({
      user: input.user || null,
      business: input.business || null,
      action: input.action,
      entity: input.entity,
      entityId: input.entityId,
      metadata: input.metadata || null,
      ipAddress: input.ipAddress || null,
      userAgent: input.userAgent || null,
    });

    return this.auditLogRepository.save(entry);
  }
}
