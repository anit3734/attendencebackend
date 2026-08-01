import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { UserRole } from "@/constants/roles";
import { UnauthorizedError } from "@/errors/app-error";
import { logger } from "@/lib/logger";

export interface IJwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  companyId?: string | null;
}

export class JwtUtil {
  public static generateAccessToken(payload: IJwtPayload): string {
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
      expiresIn: env.JWT_ACCESS_EXPIRES_IN as unknown as number,
    });
  }

  public static generateRefreshToken(payload: IJwtPayload): string {
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
      expiresIn: env.JWT_REFRESH_EXPIRES_IN as unknown as number,
    });
  }

  public static verifyAccessToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token.trim(), env.JWT_ACCESS_SECRET) as IJwtPayload;
    } catch (error) {
      logger.error({ error }, "JWT Access Token Verification Failed");
      throw new UnauthorizedError("Invalid or expired access token");
    }
  }

  public static verifyRefreshToken(token: string): IJwtPayload {
    try {
      return jwt.verify(token.trim(), env.JWT_REFRESH_SECRET) as IJwtPayload;
    } catch (error) {
      logger.error({ error }, "JWT Refresh Token Verification Failed");
      throw new UnauthorizedError("Invalid or expired refresh token");
    }
  }
}
