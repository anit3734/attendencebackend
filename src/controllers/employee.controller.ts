import { NextResponse } from "next/server";
import { EmployeeService } from "@/services/employee.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  assignRoleSchema,
  updateEmployeeStatusSchema,
} from "@/validations/employee.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";
import { EmployeeStatus } from "@/models/employee.model";

export class EmployeeController {
  private employeeService: EmployeeService;

  constructor() {
    this.employeeService = new EmployeeService();
  }

  public create = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    const body = await req.json();
    const validatedData = createEmployeeSchema.parse(body);
    const employee = await this.employeeService.createEmployee(validatedData);

    return ResponseHelper.success(
      employee,
      "Employee created successfully",
      HTTP_STATUS.CREATED
    );
  };

  public getByCompany = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
    ]);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || userPayload.companyId;
    const status = (searchParams.get("status") as EmployeeStatus) || undefined;

    if (!companyId) {
      return ResponseHelper.error("Company ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const employees = await this.employeeService.getEmployeesByCompany(companyId, status);

    return ResponseHelper.success(
      employees,
      "Employees retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getById = async (req: Request, id: string): Promise<NextResponse> => {
    await authGuard(req);
    const employee = await this.employeeService.getEmployeeById(id);

    return ResponseHelper.success(
      employee,
      "Employee profile retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public update = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    const body = await req.json();
    const validatedData = updateEmployeeSchema.parse(body);
    const updated = await this.employeeService.updateEmployeeProfile(id, validatedData);

    return ResponseHelper.success(
      updated,
      "Employee profile updated successfully",
      HTTP_STATUS.OK
    );
  };

  public assignRole = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]);

    const body = await req.json();
    const validatedData = assignRoleSchema.parse(body);
    const updated = await this.employeeService.assignRole(id, validatedData.role);

    return ResponseHelper.success(
      updated,
      "Employee role updated successfully",
      HTTP_STATUS.OK
    );
  };

  public updateStatus = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    const body = await req.json();
    const validatedData = updateEmployeeStatusSchema.parse(body);
    const updated = await this.employeeService.updateStatus(id, validatedData.status);

    return ResponseHelper.success(
      updated,
      "Employee status updated successfully",
      HTTP_STATUS.OK
    );
  };
}
