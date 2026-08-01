import mongoose, { Schema, Document, Model } from "mongoose";

export interface IOfficeLocation {
  latitude: number;
  longitude: number;
  radiusInMeters: number;
  address?: string;
}

export interface ICompanySettings {
  workingDays: number[]; // 0=Sunday, 1=Monday, ..., 6=Saturday
  shiftStartTime: string; // HH:mm format, e.g., "09:00"
  shiftEndTime: string; // HH:mm format, e.g., "18:00"
  gracePeriodInMinutes: number; // e.g., 15 minutes
  halfDayThresholdHours: number; // e.g., 4.5 hours
  fullDayThresholdHours: number; // e.g., 8.0 hours
  allowRemoteClockIn: boolean;
  requireGeofence: boolean;
}

export interface ICompany extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  code: string;
  email: string;
  phone?: string;
  address?: string;
  office: IOfficeLocation;
  settings: ICompanySettings;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OfficeLocationSchema = new Schema<IOfficeLocation>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    radiusInMeters: { type: Number, required: true, default: 100, min: 10 },
    address: { type: String, trim: true },
  },
  { _id: false }
);

const CompanySettingsSchema = new Schema<ICompanySettings>(
  {
    workingDays: {
      type: [Number],
      default: [1, 2, 3, 4, 5], // Monday to Friday
      required: true,
    },
    shiftStartTime: { type: String, required: true, default: "09:00" },
    shiftEndTime: { type: String, required: true, default: "18:00" },
    gracePeriodInMinutes: { type: Number, default: 15, min: 0 },
    halfDayThresholdHours: { type: Number, default: 4.5, min: 1 },
    fullDayThresholdHours: { type: Number, default: 8.0, min: 1 },
    allowRemoteClockIn: { type: Boolean, default: false },
    requireGeofence: { type: Boolean, default: true },
  },
  { _id: false }
);

const CompanySchema = new Schema<ICompany>(
  {
    name: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
      minlength: [2, "Company name must be at least 2 characters"],
      maxlength: [100, "Company name cannot exceed 100 characters"],
    },
    code: {
      type: String,
      required: [true, "Company code is required"],
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Company email is required"],
      lowercase: true,
      trim: true,
    },
    phone: { type: String, trim: true },
    address: { type: String, trim: true },
    office: {
      type: OfficeLocationSchema,
      required: true,
      default: () => ({
        latitude: 28.6139,
        longitude: 77.209,
        radiusInMeters: 100,
        address: "Default Office",
      }),
    },
    settings: {
      type: CompanySettingsSchema,
      required: true,
      default: () => ({
        workingDays: [1, 2, 3, 4, 5],
        shiftStartTime: "09:00",
        shiftEndTime: "18:00",
        gracePeriodInMinutes: 15,
        halfDayThresholdHours: 4.5,
        fullDayThresholdHours: 8.0,
        allowRemoteClockIn: false,
        requireGeofence: true,
      }),
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const obj = ret as Record<string, unknown>;
        delete obj.__v;
        return obj;
      },
    },
  }
);

CompanySchema.index({ code: 1, isActive: 1 });

export const Company: Model<ICompany> =
  mongoose.models.Company || mongoose.model<ICompany>("Company", CompanySchema);
