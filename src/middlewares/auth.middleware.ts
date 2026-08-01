import { JwtUtil, IJwtPayload } from "@/utils/jwt.util";
import { UnauthorizedError, ForbiddenError } from "@/errors/app-error";
import { UserRole } from "@/constants/roles";

export async function authGuard(req: Request): Promise<IJwtPayload> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new UnauthorizedError("Authentication token is missing or malformed");
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    throw new UnauthorizedError("Authentication token is missing");
  }

  const payload = JwtUtil.verifyAccessToken(token);
  return payload;
}

export function roleGuard(userRole: UserRole, allowedRoles: UserRole[]): void {
  if (!allowedRoles.includes(userRole)) {
    throw new ForbiddenError("You do not have permission to perform this action");
  }
}
