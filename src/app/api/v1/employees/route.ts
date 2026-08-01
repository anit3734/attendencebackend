import { catchAsync } from "@/errors/error-handler";
import { EmployeeController } from "@/controllers/employee.controller";

export const runtime = "nodejs";

const employeeController = new EmployeeController();

export const POST = catchAsync(async (req: Request) => {
  return await employeeController.create(req);
});

export const GET = catchAsync(async (req: Request) => {
  return await employeeController.getByCompany(req);
});
