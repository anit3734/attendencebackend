import { catchAsync } from "@/errors/error-handler";
import { AuthController } from "@/controllers/auth.controller";

export const runtime = "nodejs";

const authController = new AuthController();

export const GET = catchAsync(async (req: Request) => {
  return await authController.me(req);
});
