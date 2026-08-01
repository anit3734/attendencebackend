import { NextResponse } from "next/server";
import { HolidayService } from "@/services/holiday.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  createHolidaySchema,
  updateHolidaySchema,
  getHolidaysQuerySchema,
} from "@/validations/holiday.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";
import { HolidayType } from "@/models/holiday.model";

export class HolidayController {
  private holidayService: HolidayService;

  constructor() {
    this.holidayService = new HolidayService();
  }

  public create = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    const body = await req.json();
    const validatedData = createHolidaySchema.parse(body);
    const holiday = await this.holidayService.createHoliday(validatedData, userPayload.userId);

    return ResponseHelper.success(
      holiday,
      "Holiday created successfully",
      HTTP_STATUS.CREATED
    );
  };

  public getCompanyHolidays = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);

    const companyId = searchParams.get("companyId") || userPayload.companyId;
    if (!companyId) {
      return ResponseHelper.error("Company ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const validatedQuery = getHolidaysQuerySchema.parse({
      year: searchParams.get("year") || undefined,
      type: searchParams.get("type") || undefined,
    });

    const holidays = await this.holidayService.getCompanyHolidays(
      companyId,
      validatedQuery.year,
      validatedQuery.type as HolidayType
    );

    return ResponseHelper.success(
      holidays,
      "Holidays retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getById = async (req: Request, id: string): Promise<NextResponse> => {
    await authGuard(req);
    const holiday = await this.holidayService.getHolidayById(id);

    return ResponseHelper.success(
      holiday,
      "Holiday details retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public update = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    const body = await req.json();
    const validatedData = updateHolidaySchema.parse(body);
    const updated = await this.holidayService.updateHoliday(id, validatedData);

    return ResponseHelper.success(
      updated,
      "Holiday record updated successfully",
      HTTP_STATUS.OK
    );
  };

  public delete = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR]);

    await this.holidayService.deleteHoliday(id);

    return ResponseHelper.success(
      {},
      "Holiday record deleted successfully",
      HTTP_STATUS.OK
    );
  };
}
