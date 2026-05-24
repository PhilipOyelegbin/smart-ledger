import { AppDataSource } from "../config/data-source";
import { User } from "../entities/user.entity";
import { NotFoundError } from "../utils/AppError";

export class UserService {
  private readonly userRepository = AppDataSource.getRepository(User);

  async getById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { businesses: true },
    });

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  async getMe(userId: string) {
    const user = await this.getById(userId);
    const { password, ...safeUser } = user;
    return safeUser;
  }
}
