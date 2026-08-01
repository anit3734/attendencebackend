import { catchAsync } from "@/errors/error-handler";
import { HolidayController } from "@/controllers/holiday.controller";

export const runtime = "nodejs";

const holidayController = new HolidayController();

export const POST = catchAsync(async (req: Request) => {
  return await holidayController.create(req);
});

export const GET = catchAsync(async (req: Request) => {
  return await holidayController.getCompanyHolidays(req);
});
