import { catchAsync } from "@/errors/error-handler";
import { NotificationController } from "@/controllers/notification.controller";

export const runtime = "nodejs";

const notificationController = new NotificationController();

export const GET = catchAsync(async (req: Request) => {
  return await notificationController.getUserNotifications(req);
});
