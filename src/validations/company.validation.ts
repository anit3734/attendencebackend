import { z } from "zod";

export const officeLocationSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radiusInMeters: z.number().min(10, "Radius must be at least 10 meters").default(100),
  address: z.string().optional(),
});

export const companySettingsSchema = z.object({
  workingDays: z.array(z.number().min(0).max(6)).default([1, 2, 3, 4, 5]),
  shiftStartTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  shiftEndTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  gracePeriodInMinutes: z.number().min(0).default(15),
  halfDayThresholdHours: z.number().min(1).default(4.5),
  fullDayThresholdHours: z.number().min(1).default(8.0),
  allowRemoteClockIn: z.boolean().default(false),
  requireGeofence: z.boolean().default(true),
});

export const createCompanySchema = z.object({
  name: z.string().min(2, "Company name must be at least 2 characters").max(100),
  code: z.string().min(2, "Company code must be at least 2 characters").max(20).transform(val => val.toUpperCase()),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  address: z.string().optional(),
  office: officeLocationSchema.optional(),
  settings: companySettingsSchema.optional(),
});

export const updateCompanySchema = createCompanySchema.partial();
export const updateGeofenceSchema = officeLocationSchema;
export const updateSettingsSchema = companySettingsSchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type UpdateGeofenceInput = z.infer<typeof updateGeofenceSchema>;
export type UpdateSettingsInput = z.infer<typeof updateSettingsSchema>;
