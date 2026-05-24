import { Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { BusinessService } from "../services/business.service";
import { AuthenticatedRequest } from "../types/http.types";

export class BusinessController {
  constructor(private readonly businessService = new BusinessService()) {}

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const result = await this.businessService.create(
      req.user!.userId,
      req.body,
    );
    sendSuccess(res, "Business created successfully", result, 201);
  });

  getById = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = String(req.params.id);
    const result = await this.businessService.getById(
      req.user!.userId,
      businessId,
      req.user?.role,
    );
    sendSuccess(res, "Business fetched successfully", result, 200);
  });

  update = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const businessId = String(req.params.id);
    const result = await this.businessService.update(
      req.user!.userId,
      businessId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Business updated successfully", result, 200);
  });
}

export const businessController = new BusinessController();
