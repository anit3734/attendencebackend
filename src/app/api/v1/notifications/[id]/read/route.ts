import { catchAsync } from "@/errors/error-handler";
import { NotificationController } from "@/controllers/notification.controller";

export const runtime = "nodejs";

const notificationController = new NotificationController();

export const PUT = catchAsync(async (req: Request, { params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  return await notificationController.markAsRead(req, id);
});
