import { Notification, INotification } from "@/models/notification.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class NotificationRepository {
  public async create(data: Partial<INotification>): Promise<INotification> {
    await connectDB();
    const notification = new Notification(data);
    return await notification.save();
  }

  public async findByUser(userId: string, isRead?: boolean, limit = 50): Promise<INotification[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (typeof isRead === "boolean") {
      query.isRead = isRead;
    }

    return await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  public async markAsRead(id: string, userId: string): Promise<INotification | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id) || !mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    return await Notification.findOneAndUpdate(
      { _id: new mongoose.Types.ObjectId(id), userId: new mongoose.Types.ObjectId(userId) },
      { $set: { isRead: true } },
      { new: true }
    ).exec();
  }

  public async markAllAsRead(userId: string): Promise<boolean> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return false;
    }

    await Notification.updateMany(
      { userId: new mongoose.Types.ObjectId(userId), isRead: false },
      { $set: { isRead: true } }
    ).exec();

    return true;
  }

  public async getUnreadCount(userId: string): Promise<number> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return 0;
    }

    return await Notification.countDocuments({
      userId: new mongoose.Types.ObjectId(userId),
      isRead: false,
    }).exec();
  }
}
