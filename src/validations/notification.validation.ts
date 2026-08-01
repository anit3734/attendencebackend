import { z } from "zod";
import { NOTIFICATION_TYPES } from "@/models/notification.model";

export const createNotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  companyId: z.string().min(1, "Company ID is required"),
  title: z.string().min(1, "Title is required").max(100),
  body: z.string().min(1, "Body is required").max(500),
  type: z.enum([
    NOTIFICATION_TYPES.ATTENDANCE,
    NOTIFICATION_TYPES.LEAVE_REQUEST,
    NOTIFICATION_TYPES.LEAVE_APPROVAL,
    NOTIFICATION_TYPES.HOLIDAY_ALERT,
    NOTIFICATION_TYPES.SYSTEM,
  ]).default(NOTIFICATION_TYPES.SYSTEM),
  data: z.record(z.unknown()).optional(),
});

export const queryNotificationSchema = z.object({
  isRead: z.enum(["true", "false"]).optional(),
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
export type QueryNotificationInput = z.infer<typeof queryNotificationSchema>;
