import { UserRole } from "../entities/user.entity";

export interface AuthenticatedUser {
  userId: string;
  email: string;
  role: UserRole;
}

export interface JwtTokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface JwtTokenBundle extends JwtTokenPair {
  jti: string;
}
