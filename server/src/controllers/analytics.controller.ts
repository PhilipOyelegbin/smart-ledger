import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AnalyticsService } from "../services/analytics.service";

export class AnalyticsController {
  constructor(private readonly analyticsService = new AnalyticsService()) {}

  dashboard = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.analyticsService.dashboard(
      req.user!.userId,
      req.user?.role,
    );
    sendSuccess(res, "Dashboard analytics fetched successfully", result, 200);
  });
}

export const analyticsController = new AnalyticsController();
