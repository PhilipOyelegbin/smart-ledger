import { AppDataSource } from "../config/data-source";
import { AuthenticationError, ConflictError } from "../utils/AppError";
import {
  hashValue,
  sha256,
  verifyHash,
  createRandomToken,
} from "../utils/hash";
import { TokenService, TokenContext } from "./token.service";
import { EmailService } from "./email.service";
import { AuditLogService } from "./audit-log.service";
import { User, UserRole } from "../entities/user.entity";
import { PasswordResetToken } from "../entities/password-reset-token.entity";
import { EmailVerificationToken } from "../entities/email-verification-token.entity";
import {
  RegisterDto,
  LoginDto,
  RefreshDto,
  ForgotPasswordDto,
  ResetPasswordDto,
  VerifyEmailDto,
} from "../dtos/auth.dto";

export class AuthService {
  private readonly userRepository = AppDataSource.getRepository(User);
  private readonly passwordResetTokenRepository =
    AppDataSource.getRepository(PasswordResetToken);
  private readonly emailVerificationTokenRepository =
    AppDataSource.getRepository(EmailVerificationToken);

  constructor(
    private readonly tokenService = new TokenService(),
    private readonly emailService = new EmailService(),
    private readonly auditLogService = new AuditLogService(),
  ) {}

  async register(dto: RegisterDto, context: TokenContext = {}) {
    const existingUser = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingUser) {
      throw new ConflictError("Email is already registered");
    }

    const user = this.userRepository.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      password: await hashValue(dto.password),
      role: UserRole.USER,
      emailVerified: false,
    });

    const savedUser = await this.userRepository.save(user);
    const verificationToken = createRandomToken();
    const verificationTokenRecord =
      this.emailVerificationTokenRepository.create({
        user: savedUser,
        tokenHash: sha256(verificationToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      });

    await this.emailVerificationTokenRepository.save(verificationTokenRecord);
    await this.emailService.sendVerificationEmail(
      savedUser.email,
      verificationToken,
      savedUser.name,
    );
    await this.auditLogService.create({
      user: savedUser,
      action: "REGISTER",
      entity: "User",
      entityId: savedUser.id,
      metadata: { email: savedUser.email },
      ipAddress: context.ipAddress || null,
      userAgent: context.userAgent || null,
    });

    const tokens = await this.tokenService.issueTokens(savedUser, context);
    const { password, ...safeUser } = savedUser;

    return { user: safeUser, tokens };
  }

  async login(dto: LoginDto, context: TokenContext = {}) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      throw new AuthenticationError("Invalid email or password");
    }

    const valid = await verifyHash(user.password, dto.password);
    if (!valid) {
      throw new AuthenticationError("Invalid email or password");
    }

    const tokens = await this.tokenService.issueTokens(user, context);
    const { password, ...safeUser } = user;
    return { user: safeUser, tokens };
  }

  async refresh(dto: RefreshDto, context: TokenContext = {}) {
    const tokens = await this.tokenService.rotateRefreshToken(
      dto.refreshToken,
      context,
    );
    return tokens;
  }

  async logout(dto: RefreshDto) {
    await this.tokenService.revokeRefreshToken(dto.refreshToken);
    return { success: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: dto.email.toLowerCase() },
    });
    if (!user) {
      return { success: true };
    }

    const token = createRandomToken();
    const tokenRecord = this.passwordResetTokenRepository.create({
      user,
      tokenHash: sha256(token),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await this.passwordResetTokenRepository.save(tokenRecord);
    await this.emailService.sendPasswordResetEmail(
      user.email,
      token,
      user.name,
    );
    return { success: true };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = sha256(dto.token);
    const tokenRecord = await this.passwordResetTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord.usedAt ||
      tokenRecord.expiresAt < new Date()
    ) {
      throw new AuthenticationError("Reset token is invalid or expired");
    }

    tokenRecord.usedAt = new Date();
    tokenRecord.user.password = await hashValue(dto.password);
    await this.passwordResetTokenRepository.save(tokenRecord);
    await this.userRepository.save(tokenRecord.user);

    return { success: true };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = sha256(dto.token);
    const tokenRecord = await this.emailVerificationTokenRepository.findOne({
      where: { tokenHash },
      relations: { user: true },
    });

    if (
      !tokenRecord ||
      tokenRecord?.verifiedAt ||
      tokenRecord?.expiresAt < new Date()
    ) {
      throw new AuthenticationError("Verification token is invalid or expired");
    }

    tokenRecord.verifiedAt = new Date();
    tokenRecord.user.emailVerified = true;
    await this.emailVerificationTokenRepository.save(tokenRecord);
    await this.userRepository.save(tokenRecord.user);

    const { password, ...safeUser } = tokenRecord.user;
    return { user: safeUser };
  }
}
