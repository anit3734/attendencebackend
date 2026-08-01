import { catchAsync } from "@/errors/error-handler";
import { CompanyController } from "@/controllers/company.controller";

export const runtime = "nodejs";

const companyController = new CompanyController();

export const POST = catchAsync(async (req: Request) => {
  return await companyController.create(req);
});

export const GET = catchAsync(async (req: Request) => {
  return await companyController.getAll(req);
});
