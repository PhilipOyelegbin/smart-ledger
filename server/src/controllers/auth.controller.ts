import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AuthService } from "../services/auth.service";
import type { WritableResponse } from "../types/http.types";

export class AuthController {
  constructor(private readonly authService = new AuthService()) {}

  register = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.register(req.body, {
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip,
    });
    sendSuccess(res, "User registered successfully", result, 201);
  });

  login = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.login(req.body, {
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip,
    });
    sendSuccess(res, "Login successful", result, 200);
  });

  refresh = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.refresh(req.body, {
      userAgent: req.headers["user-agent"] || null,
      ipAddress: req.ip,
    });
    sendSuccess(res, "Token refreshed successfully", result, 200);
  });

  logout = asyncHandler(async (req: any, res: WritableResponse) => {
    await this.authService.logout(req.body);
    sendSuccess(res, "Logout successful", { success: true }, 200);
  });

  forgotPassword = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.forgotPassword(req.body);
    sendSuccess(res, "Password reset email sent", result, 200);
  });

  resetPassword = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.resetPassword(req.body);
    sendSuccess(res, "Password reset successful", result, 200);
  });

  verifyEmail = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.authService.verifyEmail(req.body);
    sendSuccess(res, "Email verified successfully", result, 200);
  });
}

export const authController = new AuthController();
