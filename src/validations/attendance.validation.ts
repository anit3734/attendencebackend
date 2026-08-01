import { z } from "zod";

export const clockInSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  deviceInfo: z.string().optional(),
  remarks: z.string().optional(),
});

export const clockOutSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  address: z.string().optional(),
  deviceInfo: z.string().optional(),
  remarks: z.string().optional(),
});

export const historyQuerySchema = z.object({
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)").optional(),
});

export const summaryQuerySchema = z.object({
  companyId: z.string().optional(),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
});

export type ClockInInput = z.infer<typeof clockInSchema>;
export type ClockOutInput = z.infer<typeof clockOutSchema>;
export type HistoryQueryInput = z.infer<typeof historyQuerySchema>;
export type SummaryQueryInput = z.infer<typeof summaryQuerySchema>;
