import { z } from "zod";
import { ROLES } from "@/constants/roles";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100),
  role: z
    .enum([
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.MANAGER,
      ROLES.HR,
      ROLES.EMPLOYEE,
    ])
    .default(ROLES.EMPLOYEE),
  companyId: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;
