import { catchAsync } from "@/errors/error-handler";
import { CompanyController } from "@/controllers/company.controller";

export const runtime = "nodejs";

const companyController = new CompanyController();

export const GET = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await companyController.getById(req, id);
});

export const PUT = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await companyController.update(req, id);
});
