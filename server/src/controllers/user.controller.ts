import { asyncHandler } from "../utils/asyncHandler";
import { sendSuccess } from "../utils/response";
import { UserService } from "../services/user.service";
import type { WritableResponse } from "../types/http.types";

export class UserController {
  constructor(private readonly userService = new UserService()) {}

  me = asyncHandler(async (req: any, res: WritableResponse) => {
    const result = await this.userService.getMe(req.user!.userId);
    sendSuccess(res, "Current user fetched successfully", result, 200);
  });
}

export const userController = new UserController();
