import { NextResponse } from "next/server";
import { NotificationService } from "@/services/notification.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";
import { authGuard } from "@/middlewares/auth.middleware";

export class NotificationController {
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
  }

  public getUserNotifications = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const { searchParams } = new URL(req.url);

    const isReadParam = searchParams.get("isRead");
    const isRead = isReadParam === "true" ? true : isReadParam === "false" ? false : undefined;
    const limit = searchParams.get("limit") ? parseInt(searchParams.get("limit")!, 10) : 50;

    const notifications = await this.notificationService.getUserNotifications(
      userPayload.userId,
      isRead,
      limit
    );

    return ResponseHelper.success(
      notifications,
      "User notifications retrieved successfully",
      HTTP_STATUS.OK
    );
  };

  public getUnreadCount = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const count = await this.notificationService.getUnreadCount(userPayload.userId);

    return ResponseHelper.success(
      { unreadCount: count },
      "Unread notification count retrieved",
      HTTP_STATUS.OK
    );
  };

  public markAsRead = async (req: Request, id: string): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    const updated = await this.notificationService.markNotificationAsRead(id, userPayload.userId);

    return ResponseHelper.success(
      updated,
      "Notification marked as read",
      HTTP_STATUS.OK
    );
  };

  public markAllAsRead = async (req: Request): Promise<NextResponse> => {
    const userPayload = await authGuard(req);
    await this.notificationService.markAllNotificationsAsRead(userPayload.userId);

    return ResponseHelper.success(
      {},
      "All notifications marked as read",
      HTTP_STATUS.OK
    );
  };
}
