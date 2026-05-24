import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { AnalyticsService } from "../services/analytics.service";
import type { WritableResponse } from "../types/http.types";

export class AnalyticsController {
  constructor(private readonly analyticsService = new AnalyticsService()) {}

  dashboard = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.analyticsService.dashboard(
      req.user!.userId,
      req.user?.role,
    );
    sendSuccess(res, "Dashboard analytics fetched successfully", result, 200);
  });
}

export const analyticsController = new AnalyticsController();
