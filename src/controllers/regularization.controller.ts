import { NextResponse } from "next/server";
import { RegularizationService } from "@/services/regularization.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  applyRegularizationSchema,
  reviewRegularizationSchema,
} from "@/validations/regularization.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";

export class RegularizationController {
  private regularizationService: RegularizationService;

  constructor() {
    this.regularizationService = new RegularizationService();
  }

  public apply = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    const validatedData = applyRegularizationSchema.parse(body);

    const result = await this.regularizationService.applyRegularization(userPayload.userId, validatedData);

    return ResponseHelper.success(
      result,
      "Attendance regularization request submitted successfully",
      HTTP_STATUS.CREATED
    );
  };

  public getList = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId");

    let results;
    if (companyId && [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR, ROLES.MANAGER].includes(userPayload.role as any)) {
      const status = searchParams.get("status") || undefined;
      results = await this.regularizationService.getCompanyRegularizations(companyId, status);
    } else {
      results = await this.regularizationService.getUserRegularizations(userPayload.userId);
    }

    return ResponseHelper.success(
      results,
      "Regularization requests retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public review = async (req: Request, params: { id: string }): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
    ]);

    const body = await req.json();
    const validatedData = reviewRegularizationSchema.parse(body);

    const result = await this.regularizationService.reviewRegularization(
      params.id,
      userPayload.userId,
      validatedData
    );

    return ResponseHelper.success(
      result,
      `Regularization request ${validatedData.status.toLowerCase()} successfully`,
      HTTP_STATUS.OK
    );
  };
}
