import { catchAsync } from "@/errors/error-handler";
import { LeaveController } from "@/controllers/leave.controller";

export const runtime = "nodejs";

const leaveController = new LeaveController();

export const GET = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await leaveController.getById(req, id);
});
