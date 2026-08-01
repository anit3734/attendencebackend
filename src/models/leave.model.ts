import mongoose, { Schema, Document, Model } from "mongoose";

export const LEAVE_TYPES = {
  CASUAL: "CASUAL",
  SICK: "SICK",
  PAID: "PAID",
  UNPAID: "UNPAID",
  WFH: "WFH",
} as const;

export type LeaveType = (typeof LEAVE_TYPES)[keyof typeof LEAVE_TYPES];

export const LEAVE_STATUS = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
  CANCELLED: "CANCELLED",
} as const;

export type LeaveStatus = (typeof LEAVE_STATUS)[keyof typeof LEAVE_STATUS];

export interface ILeave extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  totalDays: number;
  reason: string;
  status: LeaveStatus;
  reviewedBy?: mongoose.Types.ObjectId | null;
  reviewRemarks?: string;
  reviewedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveSchema = new Schema<ILeave>(
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
    leaveType: {
      type: String,
      enum: Object.values(LEAVE_TYPES),
      default: LEAVE_TYPES.CASUAL,
      required: true,
    },
    startDate: {
      type: String,
      required: [true, "Start date (YYYY-MM-DD) is required"],
      index: true,
    },
    endDate: {
      type: String,
      required: [true, "End date (YYYY-MM-DD) is required"],
      index: true,
    },
    totalDays: {
      type: Number,
      required: true,
      min: 0.5,
    },
    reason: {
      type: String,
      required: [true, "Leave reason is required"],
      trim: true,
      minlength: [5, "Reason must be at least 5 characters"],
      maxlength: [500, "Reason cannot exceed 500 characters"],
    },
    status: {
      type: String,
      enum: Object.values(LEAVE_STATUS),
      default: LEAVE_STATUS.PENDING,
      required: true,
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    reviewRemarks: {
      type: String,
      trim: true,
    },
    reviewedAt: {
      type: Date,
      default: null,
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

LeaveSchema.index({ companyId: 1, status: 1, startDate: 1 });
LeaveSchema.index({ userId: 1, status: 1, startDate: 1 });

export const Leave: Model<ILeave> =
  mongoose.models.Leave || mongoose.model<ILeave>("Leave", LeaveSchema);
