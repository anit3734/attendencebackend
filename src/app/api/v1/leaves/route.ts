import { catchAsync } from "@/errors/error-handler";
import { LeaveController } from "@/controllers/leave.controller";

export const runtime = "nodejs";

const leaveController = new LeaveController();

export const POST = catchAsync(async (req: Request) => {
  return await leaveController.applyLeave(req);
});

export const GET = catchAsync(async (req: Request) => {
  return await leaveController.getLeaves(req);
});
