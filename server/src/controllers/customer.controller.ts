import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { CustomerService } from "../services/customer.service";

export class CustomerController {
  constructor(private readonly customerService = new CustomerService()) {}

  create = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.customerService.create(
      req.user!.userId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Customer created successfully", result, 201);
  });

  list = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.customerService.list(
      req.user!.userId,
      req.query as any,
      req.user?.role,
    );
    sendSuccess(res, "Customers fetched successfully", result, 200);
  });

  getById = asyncHandler(async (req: Request, res: Response) => {
    const customerId = String(req.params.id);
    const result = await this.customerService.getById(
      req.user!.userId,
      customerId,
      req.user?.role,
    );
    sendSuccess(res, "Customer fetched successfully", result, 200);
  });

  update = asyncHandler(async (req: Request, res: Response) => {
    const customerId = String(req.params.id);
    const result = await this.customerService.update(
      req.user!.userId,
      customerId,
      req.body,
      req.user?.role,
    );
    sendSuccess(res, "Customer updated successfully", result, 200);
  });

  delete = asyncHandler(async (req: Request, res: Response) => {
    const customerId = String(req.params.id);
    const result = await this.customerService.delete(
      req.user!.userId,
      customerId,
      req.user?.role,
    );
    sendSuccess(res, "Customer deleted successfully", result, 200);
  });

  history = asyncHandler(async (req: Request, res: Response) => {
    const customerId = String(req.params.id);
    const result = await this.customerService.invoiceHistory(
      req.user!.userId,
      customerId,
      req.user?.role,
    );
    sendSuccess(
      res,
      "Customer invoice history fetched successfully",
      result,
      200,
    );
  });
}

export const customerController = new CustomerController();
