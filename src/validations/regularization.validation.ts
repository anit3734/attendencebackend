import { z } from "zod";

export const applyRegularizationSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  requestedClockIn: z.string().optional(),
  requestedClockOut: z.string().optional(),
  reason: z.string().min(5, "Reason must be at least 5 characters long"),
});

export const reviewRegularizationSchema = z.object({
  status: z.enum(["APPROVED", "REJECTED"]),
  reviewRemarks: z.string().optional(),
});
