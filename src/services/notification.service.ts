import { NotificationRepository } from "@/repositories/notification.repository";
import { CreateNotificationInput } from "@/validations/notification.validation";
import { NotFoundError } from "@/errors/app-error";
import { INotification } from "@/models/notification.model";
import mongoose from "mongoose";

export class NotificationService {
  private notificationRepository: NotificationRepository;

  constructor() {
    this.notificationRepository = new NotificationRepository();
  }

  public async sendNotification(input: CreateNotificationInput): Promise<INotification> {
    return await this.notificationRepository.create({
      userId: new mongoose.Types.ObjectId(input.userId),
      companyId: new mongoose.Types.ObjectId(input.companyId),
      title: input.title,
      body: input.body,
      type: input.type,
      data: input.data || {},
      isRead: false,
    });
  }

  public async getUserNotifications(
    userId: string,
    isRead?: boolean,
    limit = 50
  ): Promise<INotification[]> {
    return await this.notificationRepository.findByUser(userId, isRead, limit);
  }

  public async markNotificationAsRead(id: string, userId: string): Promise<INotification> {
    const updated = await this.notificationRepository.markAsRead(id, userId);
    if (!updated) {
      throw new NotFoundError("Notification not found");
    }
    return updated;
  }

  public async markAllNotificationsAsRead(userId: string): Promise<void> {
    await this.notificationRepository.markAllAsRead(userId);
  }

  public async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.getUnreadCount(userId);
  }
}
