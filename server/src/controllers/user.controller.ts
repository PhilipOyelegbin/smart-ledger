import { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { UserService } from "../services/user.service";

export class UserController {
  constructor(private readonly userService = new UserService()) {}

  me = asyncHandler(async (req: Request, res: Response) => {
    const result = await this.userService.getMe(req.user!.userId);
    sendSuccess(res, "Current user fetched successfully", result, 200);
  });
}

export const userController = new UserController();
