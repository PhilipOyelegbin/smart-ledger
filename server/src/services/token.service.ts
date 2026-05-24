import { AppDataSource } from "../config/data-source";
import { RefreshToken } from "../entities/refresh-token.entity";
import { User } from "../entities/user.entity";
import { AuthenticatedUser, JwtTokenBundle } from "../types/auth.types";
import { buildTokenPair, verifyRefreshToken } from "../utils/jwt";
import { hashValue, createRandomToken, verifyHash } from "../utils/hash";
import { AuthenticationError } from "../utils/AppError";

export interface TokenContext {
  userAgent?: string | null;
  ipAddress?: string | null;
}

export class TokenService {
  private readonly refreshTokenRepository =
    AppDataSource.getRepository(RefreshToken);

  async issueTokens(
    user: User,
    context: TokenContext = {},
  ): Promise<JwtTokenBundle> {
    const tokenPayload: AuthenticatedUser = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const bundle = buildTokenPair(tokenPayload);
    const tokenHash = await hashValue(bundle.refreshToken);

    const refreshTokenRecord = this.refreshTokenRepository.create({
      user,
      jti: bundle.jti,
      tokenHash,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      userAgent: context.userAgent || null,
      ipAddress: context.ipAddress || null,
    });

    await this.refreshTokenRepository.save(refreshTokenRecord);
    return bundle;
  }

  async rotateRefreshToken(refreshToken: string, context: TokenContext = {}) {
    const payload = verifyRefreshToken(refreshToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { jti: payload.jti },
      relations: { user: true },
    });

    if (!record || record.revokedAt) {
      throw new AuthenticationError("Refresh token is not valid");
    }

    if (record.expiresAt.getTime() < Date.now()) {
      record.revokedAt = new Date();
      await this.refreshTokenRepository.save(record);
      throw new AuthenticationError("Refresh token is not valid");
    }

    const valid = await verifyHash(record.tokenHash, refreshToken);
    if (!valid) {
      throw new AuthenticationError("Refresh token is not valid");
    }

    record.revokedAt = new Date();
    await this.refreshTokenRepository.save(record);

    return this.issueTokens(record.user, context);
  }

  async revokeRefreshToken(refreshToken: string) {
    const payload = verifyRefreshToken(refreshToken);
    const record = await this.refreshTokenRepository.findOne({
      where: { jti: payload.jti },
    });

    if (record && !record.revokedAt) {
      record.revokedAt = new Date();
      await this.refreshTokenRepository.save(record);
    }
  }

  async generatePasswordResetToken(): Promise<{
    token: string;
    tokenHash: string;
  }> {
    const token = createRandomToken();
    const tokenHash = await hashValue(token);
    return { token, tokenHash };
  }
}
