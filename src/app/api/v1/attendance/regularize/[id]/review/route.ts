import { catchAsync } from "@/errors/error-handler";
import { RegularizationController } from "@/controllers/regularization.controller";

export const runtime = "nodejs";

const regularizationController = new RegularizationController();

export const PUT = catchAsync(
  async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
    const resolvedParams = await params;
    return await regularizationController.review(req, resolvedParams);
  }
);
