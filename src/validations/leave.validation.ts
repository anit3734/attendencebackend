import { z } from "zod";
import { LEAVE_TYPES, LEAVE_STATUS } from "@/models/leave.model";

export const applyLeaveSchema = z
  .object({
    leaveType: z.enum([
      LEAVE_TYPES.CASUAL,
      LEAVE_TYPES.SICK,
      LEAVE_TYPES.PAID,
      LEAVE_TYPES.UNPAID,
      LEAVE_TYPES.WFH,
    ]).default(LEAVE_TYPES.CASUAL),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid start date format (YYYY-MM-DD)"),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid end date format (YYYY-MM-DD)"),
    reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
  })
  .refine((data) => data.startDate <= data.endDate, {
    message: "Start date must be less than or equal to end date",
    path: ["endDate"],
  });

export const reviewLeaveSchema = z.object({
  status: z.enum([LEAVE_STATUS.APPROVED, LEAVE_STATUS.REJECTED]),
  reviewRemarks: z.string().optional(),
});

export const queryLeaveSchema = z.object({
  companyId: z.string().optional(),
  userId: z.string().optional(),
  status: z.enum([
    LEAVE_STATUS.PENDING,
    LEAVE_STATUS.APPROVED,
    LEAVE_STATUS.REJECTED,
    LEAVE_STATUS.CANCELLED,
  ]).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
});

export type ApplyLeaveInput = z.infer<typeof applyLeaveSchema>;
export type ReviewLeaveInput = z.infer<typeof reviewLeaveSchema>;
export type QueryLeaveInput = z.infer<typeof queryLeaveSchema>;
