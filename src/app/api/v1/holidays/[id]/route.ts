import { catchAsync } from "@/errors/error-handler";
import { HolidayController } from "@/controllers/holiday.controller";

export const runtime = "nodejs";

const holidayController = new HolidayController();

export const GET = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await holidayController.getById(req, id);
});

export const PUT = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await holidayController.update(req, id);
});

export const DELETE = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await holidayController.delete(req, id);
});
