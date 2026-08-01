import { Leave, ILeave, LeaveStatus } from "@/models/leave.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class LeaveRepository {
  public async create(leaveData: Partial<ILeave>): Promise<ILeave> {
    await connectDB();
    const leave = new Leave(leaveData);
    return await leave.save();
  }

  public async findById(id: string): Promise<ILeave | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Leave.findById(id)
      .populate("userId", "name email role")
      .populate("employeeId", "employeeId designation department")
      .populate("companyId", "name code")
      .populate("reviewedBy", "name email role")
      .exec();
  }

  public async findByUser(userId: string, year?: number, status?: LeaveStatus): Promise<ILeave[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (status) query.status = status;
    if (year) {
      const yearPrefix = `${year}-`;
      query.startDate = { $regex: `^${yearPrefix}` };
    }

    return await Leave.find(query).sort({ createdAt: -1 }).exec();
  }

  public async findByCompany(companyId: string, status?: LeaveStatus, year?: number): Promise<ILeave[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    if (status) query.status = status;
    if (year) {
      const yearPrefix = `${year}-`;
      query.startDate = { $regex: `^${yearPrefix}` };
    }

    return await Leave.find(query)
      .populate("userId", "name email role")
      .populate("employeeId", "employeeId designation department")
      .populate("reviewedBy", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  public async findOverlappingLeaves(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<ILeave[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    return await Leave.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: { $in: ["PENDING", "APPROVED"] },
      $or: [
        { startDate: { $lte: endDate }, endDate: { $gte: startDate } },
      ],
    }).exec();
  }

  public async updateStatus(
    id: string,
    status: LeaveStatus,
    reviewedBy?: string,
    reviewRemarks?: string
  ): Promise<ILeave | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }

    const update: Record<string, unknown> = {
      status,
      reviewedAt: new Date(),
    };

    if (reviewedBy) {
      update.reviewedBy = new mongoose.Types.ObjectId(reviewedBy);
    }
    if (reviewRemarks) {
      update.reviewRemarks = reviewRemarks;
    }

    return await Leave.findByIdAndUpdate(id, { $set: update }, { new: true })
      .populate("userId", "name email role")
      .populate("employeeId", "employeeId designation department")
      .populate("reviewedBy", "name email")
      .exec();
  }
}
