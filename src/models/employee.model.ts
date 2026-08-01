import mongoose, { Schema, Document, Model } from "mongoose";

export const EMPLOYMENT_TYPES = {
  FULL_TIME: "FULL_TIME",
  PART_TIME: "PART_TIME",
  CONTRACT: "CONTRACT",
  INTERN: "INTERN",
} as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

export const EMPLOYEE_STATUS = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  ON_LEAVE: "ON_LEAVE",
  TERMINATED: "TERMINATED",
} as const;

export type EmployeeStatus = (typeof EMPLOYEE_STATUS)[keyof typeof EMPLOYEE_STATUS];

export interface IEmployee extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  companyId: mongoose.Types.ObjectId;
  employeeId: string; // e.g. "EMP001"
  designation: string;
  department: string;
  joiningDate: Date;
  phone?: string;
  emergencyContact?: string;
  salary?: number;
  employmentType: EmploymentType;
  status: EmployeeStatus;
  managerId?: mongoose.Types.ObjectId | null;
  leaveBalances: {
    casual: number;
    sick: number;
    earned: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployee>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    companyId: {
      type: Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, "Employee ID is required"],
      trim: true,
      uppercase: true,
    },
    designation: {
      type: String,
      required: [true, "Designation is required"],
      trim: true,
    },
    department: {
      type: String,
      required: [true, "Department is required"],
      trim: true,
    },
    joiningDate: {
      type: Date,
      default: Date.now,
    },
    phone: { type: String, trim: true },
    emergencyContact: { type: String, trim: true },
    salary: { type: Number, min: 0 },
    employmentType: {
      type: String,
      enum: Object.values(EMPLOYMENT_TYPES),
      default: EMPLOYMENT_TYPES.FULL_TIME,
    },
    status: {
      type: String,
      enum: Object.values(EMPLOYEE_STATUS),
      default: EMPLOYEE_STATUS.ACTIVE,
      index: true,
    },
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    leaveBalances: {
      casual: { type: Number, default: 8 },
      sick: { type: Number, default: 5 },
      earned: { type: Number, default: 12 },
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

// Compound index: employeeId must be unique per company
EmployeeSchema.index({ companyId: 1, employeeId: 1 }, { unique: true });
EmployeeSchema.index({ companyId: 1, status: 1 });

export const Employee: Model<IEmployee> =
  mongoose.models.Employee || mongoose.model<IEmployee>("Employee", EmployeeSchema);
