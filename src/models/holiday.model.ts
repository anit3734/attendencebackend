import mongoose, { Schema, Document, Model } from "mongoose";

export const HOLIDAY_TYPES = {
  MANDATORY: "MANDATORY",
  OPTIONAL: "OPTIONAL",
} as const;

export type HolidayType = (typeof HOLIDAY_TYPES)[keyof typeof HOLIDAY_TYPES];

export interface IHoliday extends Document {
  _id: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  title: string;
  date: string; // YYYY-MM-DD format
  year: number; // e.g. 2026
  type: HolidayType;
  description?: string;
  createdBy: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HolidaySchema = new Schema<IHoliday>(
  {
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, "Holiday title is required"],
      trim: true,
      minlength: [2, "Title must be at least 2 characters"],
      maxlength: [100, "Title cannot exceed 100 characters"],
    },
    date: {
      type: String,
      required: [true, "Holiday date (YYYY-MM-DD) is required"],
      index: true,
    },
    year: {
      type: Number,
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(HOLIDAY_TYPES),
      default: HOLIDAY_TYPES.MANDATORY,
      required: true,
    },
    description: { type: String, trim: true },
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

// Compound index: Prevent duplicate holidays on the same date for a company
HolidaySchema.index({ companyId: 1, date: 1 }, { unique: true });
HolidaySchema.index({ companyId: 1, year: 1, type: 1 });

export const Holiday: Model<IHoliday> =
  mongoose.models.Holiday || mongoose.model<IHoliday>("Holiday", HolidaySchema);
