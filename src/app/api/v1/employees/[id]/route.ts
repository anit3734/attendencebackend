import { catchAsync } from "@/errors/error-handler";
import { EmployeeController } from "@/controllers/employee.controller";

export const runtime = "nodejs";

const employeeController = new EmployeeController();

export const GET = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await employeeController.getById(req, id);
});

export const PUT = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await employeeController.update(req, id);
});
