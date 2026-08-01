import { catchAsync } from "@/errors/error-handler";
import { AttendanceController } from "@/controllers/attendance.controller";

export const runtime = "nodejs";

const attendanceController = new AttendanceController();

export const POST = catchAsync(async (req: Request) => {
  return await attendanceController.clockOut(req);
});
