import { NextResponse } from "next/server";
import { AttendanceService } from "@/services/attendance.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  clockInSchema,
  clockOutSchema,
  historyQuerySchema,
} from "@/validations/attendance.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";

export class AttendanceController {
  private attendanceService: AttendanceService;

  constructor() {
    this.attendanceService = new AttendanceService();
  }

  public clockIn = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    const validatedData = clockInSchema.parse(body);

    const attendance = await this.attendanceService.clockIn(userPayload.userId, validatedData);

    return ResponseHelper.success(
      attendance,
      "Clock in recorded successfully",
      HTTP_STATUS.CREATED
    );
  };

  public clockOut = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    const validatedData = clockOutSchema.parse(body);

    const attendance = await this.attendanceService.clockOut(userPayload.userId, validatedData);

    return ResponseHelper.success(
      attendance,
      "Clock out recorded successfully",
      HTTP_STATUS.OK
    );
  };

  public getToday = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const attendance = await this.attendanceService.getTodayAttendance(userPayload.userId);

    return ResponseHelper.success(
      attendance,
      attendance ? "Today's attendance retrieved" : "No attendance record found for today",
      HTTP_STATUS.OK
    );
  };

  public getHistory = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);

    const validatedQuery = historyQuerySchema.parse({
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
    });

    const history = await this.attendanceService.getAttendanceHistory(
      userPayload.userId,
      validatedQuery.startDate,
      validatedQuery.endDate
    );

    return ResponseHelper.success(
      history,
      "Attendance history retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getCompanyToday = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.HR,
      ROLES.MANAGER,
    ]);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || userPayload.companyId;

    if (!companyId) {
      return ResponseHelper.error("Company ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const attendanceList = await this.attendanceService.getCompanyTodayAttendance(companyId);

    return ResponseHelper.success(
      attendanceList,
      "Company today's attendance retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getSummary = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || userPayload.companyId || undefined;

    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const summary = await this.attendanceService.getAttendanceSummary(
      companyId || undefined,
      month,
      year,
      userPayload.userId
    );

    return ResponseHelper.success(
      summary,
      "Attendance summary analytics retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getPayrollReport = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [
      ROLES.SUPER_ADMIN,
      ROLES.COMPANY_ADMIN,
      ROLES.HR,
    ]);

    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get("companyId") || userPayload.companyId;

    if (!companyId) {
      return ResponseHelper.error("Company ID is required", HTTP_STATUS.BAD_REQUEST);
    }

    const month = searchParams.get("month") ? parseInt(searchParams.get("month")!, 10) : undefined;
    const year = searchParams.get("year") ? parseInt(searchParams.get("year")!, 10) : undefined;

    const report = await this.attendanceService.getPayrollReport(companyId, month, year);

    return ResponseHelper.success(
      report,
      "Monthly payroll & attendance report generated successfully",
      HTTP_STATUS.OK
    );
  };

  public offlineSync = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    const records = Array.isArray(body.records) ? body.records : [];

    const results = await this.attendanceService.offlineSync(userPayload.userId, records);

    return ResponseHelper.success(
      results,
      "Offline attendance records processed",
      HTTP_STATUS.OK
    );
  };
}
