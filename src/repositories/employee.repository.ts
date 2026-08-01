import { Employee, IEmployee, EmployeeStatus } from "@/models/employee.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class EmployeeRepository {
  public async create(employeeData: Partial<IEmployee>): Promise<IEmployee> {
    await connectDB();
    const employee = new Employee(employeeData);
    return await employee.save();
  }

  public async findById(id: string): Promise<IEmployee | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Employee.findById(id)
      .populate("userId", "name email role isActive")
      .populate("companyId", "name code office settings")
      .populate("managerId", "name email role")
      .exec();
  }

  public async findByUserId(userId: string): Promise<IEmployee | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return await Employee.findOne({ userId })
      .populate("userId", "name email role isActive")
      .populate("companyId", "name code office settings")
      .exec();
  }

  public async findByEmployeeId(employeeId: string, companyId: string): Promise<IEmployee | null> {
    await connectDB();
    return await Employee.findOne({
      employeeId: employeeId.toUpperCase(),
      companyId: new mongoose.Types.ObjectId(companyId),
    }).exec();
  }

  public async findAllByCompany(companyId: string, status?: EmployeeStatus): Promise<IEmployee[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      companyId: new mongoose.Types.ObjectId(companyId),
    };

    if (status) {
      query.status = status;
    }

    return await Employee.find(query)
      .populate("userId", "name email role isActive")
      .populate("managerId", "name email")
      .sort({ createdAt: -1 })
      .exec();
  }

  public async update(id: string, updateData: Partial<IEmployee>): Promise<IEmployee | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Employee.findByIdAndUpdate(id, { $set: updateData }, { new: true })
      .populate("userId", "name email role isActive")
      .populate("companyId", "name code")
      .exec();
  }

  public async updateStatus(id: string, status: EmployeeStatus): Promise<IEmployee | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Employee.findByIdAndUpdate(id, { $set: { status } }, { new: true })
      .populate("userId", "name email role isActive")
      .exec();
  }
}
