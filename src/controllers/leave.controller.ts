import { NextResponse } from "next/server";
import { LeaveService } from "@/services/leave.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import {
  applyLeaveSchema,
  reviewLeaveSchema,
  queryLeaveSchema,
} from "@/validations/leave.validation";
import { authGuard, roleGuard } from "@/middlewares/auth.middleware";
import { ROLES } from "@/constants/roles";
import { LeaveStatus } from "@/models/leave.model";

export class LeaveController {
  private leaveService: LeaveService;

  constructor() {
    this.leaveService = new LeaveService();
  }

  public applyLeave = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const body = await req.json();
    const validatedData = applyLeaveSchema.parse(body);

    const leave = await this.leaveService.applyLeave(userPayload.userId, validatedData);

    return ResponseHelper.success(
      leave,
      "Leave application submitted successfully",
      HTTP_STATUS.CREATED
    );
  };

  public getLeaves = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);

    const validatedQuery = queryLeaveSchema.parse({
      companyId: searchParams.get("companyId") || undefined,
      userId: searchParams.get("userId") || undefined,
      status: searchParams.get("status") || undefined,
      year: searchParams.get("year") || undefined,
    });

    if (
      validatedQuery.companyId &&
      [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR, ROLES.MANAGER].includes(userPayload.role as any)
    ) {
      const leaves = await this.leaveService.getCompanyLeaves(
        validatedQuery.companyId,
        validatedQuery.status as LeaveStatus,
        validatedQuery.year
      );
      return ResponseHelper.success(leaves, "Company leave records retrieved", HTTP_STATUS.OK);
    }

    const leaves = await this.leaveService.getUserLeaves(
      userPayload.userId,
      validatedQuery.year,
      validatedQuery.status as LeaveStatus
    );

    return ResponseHelper.success(leaves, "Personal leave records retrieved", HTTP_STATUS.OK);
  };

  public getById = async (req: Request, id: string): Promise<NextResponse> => {
    await authGuard(req);
    const leave = await this.leaveService.getLeaveById(id);

    return ResponseHelper.success(leave, "Leave details retrieved", HTTP_STATUS.OK);
  };

  public reviewLeave = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    roleGuard(userPayload.role, [ROLES.SUPER_ADMIN, ROLES.COMPANY_ADMIN, ROLES.HR, ROLES.MANAGER]);

    const body = await req.json();
    const validatedData = reviewLeaveSchema.parse(body);

    const reviewed = await this.leaveService.reviewLeave(id, userPayload, validatedData);

    return ResponseHelper.success(
      reviewed,
      `Leave request status updated to ${reviewed.status}`,
      HTTP_STATUS.OK
    );
  };

  public cancelLeave = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const cancelled = await this.leaveService.cancelLeave(id, userPayload.userId);

    return ResponseHelper.success(
      cancelled,
      "Leave request cancelled successfully",
      HTTP_STATUS.OK
    );
  };
}
