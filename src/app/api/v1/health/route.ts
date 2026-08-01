import { catchAsync } from "@/errors/error-handler";
import { HealthController } from "@/controllers/health.controller";

export const runtime = "nodejs";

const healthController = new HealthController();

export const GET = catchAsync(async () => {
  return await healthController.getHealth();
});
