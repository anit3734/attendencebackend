import { NextResponse } from "next/server";
import { CompanyService } from "@/services/company.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  createCompanySchema,
  updateCompanySchema,
  updateGeofenceSchema,
  updateSettingsSchema,
} from "@/validations/company.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";

export class CompanyController {
  private companyService: CompanyService;

  constructor() {
    this.companyService = new CompanyService();
  }

  public create = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]);

    const body = await req.json();
    const validatedData = createCompanySchema.parse(body);
    const company = await this.companyService.createCompany(validatedData, userPayload.userId);

    return ResponseHelper.success(
      company,
      "Company created successfully",
      HTTP_STATUS.CREATED
    );
  };

  public getAll = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN]);

    const companies = await this.companyService.getAllCompanies();

    return ResponseHelper.success(
      companies,
      "Companies retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getById = async (req: Request, id: string): Promise<NextResponse> => {
    await authGuard(req);
    const company = await this.companyService.getCompanyById(id);

    return ResponseHelper.success(
      company,
      "Company details retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public update = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]);

    const body = await req.json();
    const validatedData = updateCompanySchema.parse(body);
    const updated = await this.companyService.updateCompany(id, validatedData);

    return ResponseHelper.success(
      updated,
      "Company updated successfully",
      HTTP_STATUS.OK
    );
  };

  public updateGeofence = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]);

    const body = await req.json();
    const validatedData = updateGeofenceSchema.parse(body);
    const updated = await this.companyService.updateGeofence(id, validatedData);

    return ResponseHelper.success(
      updated,
      "Office geofence location updated successfully",
      HTTP_STATUS.OK
    );
  };

  public updateSettings = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN]);

    const body = await req.json();
    const validatedData = updateSettingsSchema.parse(body);
    const updated = await this.companyService.updateSettings(id, validatedData);

    return ResponseHelper.success(
      updated,
      "Company attendance settings updated successfully",
      HTTP_STATUS.OK
    );
  };
}
