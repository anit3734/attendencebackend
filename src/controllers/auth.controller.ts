import { NextResponse } from "next/server";
import { AuthService } from "@/services/auth.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import { registerSchema, loginSchema, refreshTokenSchema } from "@/validations/auth.validation";
import { authGuard } from "@/middlewares/auth.middleware";

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public register = async (req: Request): Promise<NextResponse> => {
    const body = await req.json();
    const validatedData = registerSchema.parse(body);
    const result = await this.authService.register(validatedData);

    return ResponseHelper.success(
      result,
      "User registered successfully",
      HTTP_STATUS.CREATED
    );
  };

  public login = async (req: Request): Promise<NextResponse> => {
    const body = await req.json();
    const validatedData = loginSchema.parse(body);
    const result = await this.authService.login(validatedData);

    return ResponseHelper.success(
      result,
      "User logged in successfully",
      HTTP_STATUS.OK
    );
  };

  public refreshToken = async (req: Request): Promise<NextResponse> => {
    const body = await req.json();
    const validatedData = refreshTokenSchema.parse(body);
    const result = await this.authService.refreshToken(validatedData.refreshToken);

    return ResponseHelper.success(
      result,
      "Token refreshed successfully",
      HTTP_STATUS.OK
    );
  };

  public logout = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    await this.authService.logout(userPayload.userId);

    return ResponseHelper.success(
      {},
      "User logged out successfully",
      HTTP_STATUS.OK
    );
  };

  public me = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const profile = await this.authService.getProfile(userPayload.userId);

    return ResponseHelper.success(
      profile,
      "User profile retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public changePassword = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    await this.authService.changePassword(userPayload.userId, {
      oldPassword: body.oldPassword,
      newPassword: body.newPassword,
    });

    return ResponseHelper.success(
      {},
      "Password changed successfully",
      HTTP_STATUS.OK
    );
  };
}
