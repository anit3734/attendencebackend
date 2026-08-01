import { z } from "zod";
import { HOLIDAY_TYPES } from "@/models/holiday.model";

export const createHolidaySchema = z.object({
  companyId: z.string().min(1, "Company ID is required"),
  title: z.string().min(2, "Title must be at least 2 characters").max(100),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  type: z.enum([HOLIDAY_TYPES.MANDATORY, HOLIDAY_TYPES.OPTIONAL]).default(HOLIDAY_TYPES.MANDATORY),
  description: z.string().optional(),
});

export const updateHolidaySchema = createHolidaySchema.partial().omit({ companyId: true });

export const getHolidaysQuerySchema = z.object({
  companyId: z.string().optional(),
  year: z.coerce.number().min(2020).max(2100).optional(),
  type: z.enum([HOLIDAY_TYPES.MANDATORY, HOLIDAY_TYPES.OPTIONAL]).optional(),
});

export type CreateHolidayInput = z.infer<typeof createHolidaySchema>;
export type UpdateHolidayInput = z.infer<typeof updateHolidaySchema>;
export type GetHolidaysQueryInput = z.infer<typeof getHolidaysQuerySchema>;
