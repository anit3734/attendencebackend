import { Regularization, IRegularization } from "@/models/regularization.model";
import mongoose from "mongoose";

export class RegularizationRepository {
  public async create(data: Partial<IRegularization>): Promise<IRegularization> {
    return await Regularization.create(data);
  }

  public async findById(id: string): Promise<IRegularization | null> {
    return await Regularization.findById(id)
      .populate("userId", "name email")
      .populate("employeeId", "employeeId department designation");
  }

  public async findExisting(userId: string, date: string): Promise<IRegularization | null> {
    return await Regularization.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
      status: { $in: ["PENDING", "APPROVED"] },
    });
  }

  public async findByCompany(companyId: string, status?: string): Promise<IRegularization[]> {
    const query: any = { companyId: new mongoose.Types.ObjectId(companyId) };
    if (status) query.status = status;

    return await Regularization.find(query)
      .populate("userId", "name email")
      .populate("employeeId", "employeeId department designation")
      .sort({ createdAt: -1 });
  }

  public async findByUser(userId: string): Promise<IRegularization[]> {
    return await Regularization.find({ userId: new mongoose.Types.ObjectId(userId) })
      .sort({ createdAt: -1 });
  }

  public async updateStatus(
    id: string,
    status: "APPROVED" | "REJECTED",
    reviewedBy: string,
    reviewRemarks?: string
  ): Promise<IRegularization | null> {
    return await Regularization.findByIdAndUpdate(
      id,
      {
        status,
        reviewedBy: new mongoose.Types.ObjectId(reviewedBy),
        reviewRemarks,
      },
      { new: true }
    );
  }
}
