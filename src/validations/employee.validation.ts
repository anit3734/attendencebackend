import { z } from "zod";
import { ROLES } from "@/constants/roles";
import { EMPLOYMENT_TYPES, EMPLOYEE_STATUS } from "@/models/employee.model";

export const createEmployeeSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([
    ROLES.COMPANY_ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE,
  ]).default(ROLES.EMPLOYEE),
  companyId: z.string().min(1, "Company ID is required"),
  employeeId: z.string().min(1, "Employee ID is required").transform(val => val.toUpperCase()),
  designation: z.string().min(1, "Designation is required"),
  department: z.string().min(1, "Department is required"),
  joiningDate: z.string().optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  salary: z.number().min(0).optional(),
  employmentType: z.enum([
    EMPLOYMENT_TYPES.FULL_TIME,
    EMPLOYMENT_TYPES.PART_TIME,
    EMPLOYMENT_TYPES.CONTRACT,
    EMPLOYMENT_TYPES.INTERN,
  ]).default(EMPLOYMENT_TYPES.FULL_TIME),
  managerId: z.string().optional().nullable(),
});

export const updateEmployeeSchema = z.object({
  designation: z.string().min(1).optional(),
  department: z.string().min(1).optional(),
  phone: z.string().optional(),
  emergencyContact: z.string().optional(),
  salary: z.number().min(0).optional(),
  employmentType: z.enum([
    EMPLOYMENT_TYPES.FULL_TIME,
    EMPLOYMENT_TYPES.PART_TIME,
    EMPLOYMENT_TYPES.CONTRACT,
    EMPLOYMENT_TYPES.INTERN,
  ]).optional(),
  managerId: z.string().optional().nullable(),
});

export const assignRoleSchema = z.object({
  role: z.enum([
    ROLES.SUPER_ADMIN,
    ROLES.COMPANY_ADMIN,
    ROLES.MANAGER,
    ROLES.HR,
    ROLES.EMPLOYEE,
  ]),
});

export const updateEmployeeStatusSchema = z.object({
  status: z.enum([
    EMPLOYEE_STATUS.ACTIVE,
    EMPLOYEE_STATUS.INACTIVE,
    EMPLOYEE_STATUS.ON_LEAVE,
    EMPLOYEE_STATUS.TERMINATED,
  ]),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;
export type AssignRoleInput = z.infer<typeof assignRoleSchema>;
export type UpdateEmployeeStatusInput = z.infer<typeof updateEmployeeStatusSchema>;
