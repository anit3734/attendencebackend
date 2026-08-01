export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  COMPANY_ADMIN: "COMPANY_ADMIN",
  MANAGER: "MANAGER",
  HR: "HR",
  EMPLOYEE: "EMPLOYEE",
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];
