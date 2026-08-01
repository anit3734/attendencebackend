import { catchAsync } from "@/errors/error-handler";
import { RegularizationController } from "@/controllers/regularization.controller";

export const runtime = "nodejs";

const regularizationController = new RegularizationController();

export const POST = catchAsync(async (req: Request) => {
  return await regularizationController.apply(req);
});

export const GET = catchAsync(async (req: Request) => {
  return await regularizationController.getList(req);
});
