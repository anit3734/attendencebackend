import mongoose, { Schema, Document, Model } from "mongoose";

export const CLOCK_IN_STATUS = {
  ON_TIME: "ON_TIME",
  LATE: "LATE",
} as const;

export type ClockInStatus = (typeof CLOCK_IN_STATUS)[keyof typeof CLOCK_IN_STATUS];

export const DAY_STATUS = {
  PRESENT: "PRESENT",
  HALF_DAY: "HALF_DAY",
  LATE: "LATE",
  ABSENT: "ABSENT",
  ON_LEAVE: "ON_LEAVE",
} as const;

export type DayStatus = (typeof DAY_STATUS)[keyof typeof DAY_STATUS];

export interface ILocationData {
  latitude: number;
  longitude: number;
  address?: string;
  distanceInMeters: number;
}

export interface IClockInRecord {
  time: Date;
  location: ILocationData;
  deviceInfo?: string;
  status: ClockInStatus;
  remarks?: string;
}

export interface IClockOutRecord {
  time: Date;
  location: ILocationData;
  deviceInfo?: string;
  remarks?: string;
}

export interface IAttendance extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD format
  clockIn: IClockInRecord;
  clockOut?: IClockOutRecord | null;
  workingHours: number; // e.g. 8.5
  overtimeHours: number;
  status: DayStatus;
  isApproved: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocationData>(
  {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, trim: true },
    distanceInMeters: { type: Number, required: true },
  },
  { _id: false }
);

const ClockInSchema = new Schema<IClockInRecord>(
  {
    time: { type: Date, required: true, default: Date.now },
    location: { type: LocationSchema, required: true },
    deviceInfo: { type: String, trim: true },
    status: {
      type: String,
      enum: Object.values(CLOCK_IN_STATUS),
      required: true,
      default: CLOCK_IN_STATUS.ON_TIME,
    },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const ClockOutSchema = new Schema<IClockOutRecord>(
  {
    time: { type: Date, required: true, default: Date.now },
    location: { type: LocationSchema, required: true },
    deviceInfo: { type: String, trim: true },
    remarks: { type: String, trim: true },
  },
  { _id: false }
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    clockIn: {
      type: ClockInSchema,
      required: true,
    },
    clockOut: {
      type: ClockOutSchema,
      default: null,
    },
    workingHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: Object.values(DAY_STATUS),
      default: DAY_STATUS.PRESENT,
      index: true,
    },
    isApproved: {
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

AttendanceSchema.index({ userId: 1, date: 1 }, { unique: true });
AttendanceSchema.index({ companyId: 1, date: 1 });

export const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);
