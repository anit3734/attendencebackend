import { UserRepository } from "@/repositories/user.repository";
import { PasswordUtil } from "@/utils/password.util";
import { JwtUtil, IJwtPayload } from "@/utils/jwt.util";
import { RegisterInput, LoginInput } from "@/validations/auth.validation";
import { ConflictError, UnauthorizedError, NotFoundError } from "@/errors/app-error";
import { IUser } from "@/models/user.model";
import { logger } from "@/lib/logger";
import mongoose from "mongoose";

export interface IAuthResponse {
  user: Partial<IUser>;
  accessToken: string;
  refreshToken: string;
}

export class AuthService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  public async register(input: RegisterInput): Promise<IAuthResponse> {
    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    const hashedPassword = await PasswordUtil.hashPassword(input.password);

    const user = await this.userRepository.create({
      name: input.name,
      email: input.email,
      password: hashedPassword,
      role: input.role,
      companyId: input.companyId ? new mongoose.Types.ObjectId(input.companyId) : null,
    });

    const payload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    await this.userRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: user.toJSON() as unknown as Partial<IUser>,
      accessToken,
      refreshToken,
    };
  }

  public async login(input: LoginInput): Promise<IAuthResponse> {
    const user = await this.userRepository.findByEmail(input.email, true);
    if (!user || !user.password) {
      throw new UnauthorizedError("Invalid email or password");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("User account is deactivated. Contact Admin.");
    }

    const isMatch = await PasswordUtil.comparePassword(input.password, user.password);
    if (!isMatch) {
      throw new UnauthorizedError("Invalid email or password");
    }

    const payload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    };

    const accessToken = JwtUtil.generateAccessToken(payload);
    const refreshToken = JwtUtil.generateRefreshToken(payload);

    await this.userRepository.updateRefreshToken(user._id.toString(), refreshToken);

    return {
      user: user.toJSON() as unknown as Partial<IUser>,
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(token: string): Promise<{ accessToken: string; refreshToken: string }> {
    const cleanToken = token.trim();
    const payload = JwtUtil.verifyRefreshToken(cleanToken);

    const user = await this.userRepository.findById(payload.userId, true);
    if (!user) {
      throw new UnauthorizedError("User associated with token no longer exists");
    }

    if (!user.isActive) {
      throw new UnauthorizedError("User account is deactivated");
    }

    if (!user.refreshToken || user.refreshToken.trim() !== cleanToken) {
      logger.warn(
        { userId: user._id.toString(), hasToken: !!user.refreshToken },
        "Refresh token mismatch or revoked"
      );
      throw new UnauthorizedError("Refresh token has been revoked or expired. Please login again.");
    }

    const newPayload: IJwtPayload = {
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      companyId: user.companyId ? user.companyId.toString() : null,
    };

    const newAccessToken = JwtUtil.generateAccessToken(newPayload);
    const newRefreshToken = JwtUtil.generateRefreshToken(newPayload);

    await this.userRepository.updateRefreshToken(user._id.toString(), newRefreshToken);

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
    };
  }

  public async logout(userId: string): Promise<void> {
    await this.userRepository.updateRefreshToken(userId, null);
  }

  public async getProfile(userId: string): Promise<Partial<IUser>> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError("User profile not found");
    }
    return user.toJSON() as unknown as Partial<IUser>;
  }
}
