import mongoose, { Schema, Document } from "mongoose";

export interface IRegularization extends Document {
  companyId: mongoose.Types.ObjectId;
  employeeId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  requestedClockIn?: string; // ISO String
  requestedClockOut?: string; // ISO String
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewRemarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RegularizationSchema = new Schema<IRegularization>(
  {
    companyId: { type: Schema.Types.ObjectId, ref: "Company", required: true, index: true },
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    date: { type: String, required: true },
    requestedClockIn: { type: String },
    requestedClockOut: { type: String },
    reason: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED"],
      default: "PENDING",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewRemarks: { type: String },
  },
  { timestamps: true }
);

RegularizationSchema.index({ companyId: 1, userId: 1, date: 1 }, { unique: true });

export const Regularization =
  mongoose.models.Regularization ||
  mongoose.model<IRegularization>("Regularization", RegularizationSchema);
