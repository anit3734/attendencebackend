import { catchAsync } from "@/errors/error-handler";
import { AuthController } from "@/controllers/auth.controller";

export const runtime = "nodejs";

const authController = new AuthController();

export const POST = catchAsync(async (req: Request) => {
  return await authController.logout(req);
});
