import { LeaveRepository } from "@/repositories/leave.repository";
import { EmployeeRepository } from "@/repositories/employee.repository";
import { CompanyRepository } from "@/repositories/company.repository";
import { ApplyLeaveInput, ReviewLeaveInput } from "@/validations/leave.validation";
import { BadRequestError, NotFoundError, ConflictError, ForbiddenError } from "@/errors/app-error";
import { ILeave, LeaveStatus } from "@/models/leave.model";
import { IJwtPayload } from "@/utils/jwt.util";
import { ROLES } from "@/constants/roles";
import mongoose from "mongoose";

export class LeaveService {
  private leaveRepository: LeaveRepository;
  private employeeRepository: EmployeeRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.leaveRepository = new LeaveRepository();
    this.employeeRepository = new EmployeeRepository();
    this.companyRepository = new CompanyRepository();
  }

  private calculateTotalDays(startDateStr: string, endDateStr: string): number {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    return diffDays;
  }

  public async applyLeave(userId: string, input: ApplyLeaveInput): Promise<ILeave> {
    const employee = await this.employeeRepository.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError("Employee profile not found for this user");
    }

    if (employee.status !== "ACTIVE") {
      throw new BadRequestError(`Cannot apply for leave. Employee status is ${employee.status}`);
    }

    const companyId = (employee.companyId as { _id?: mongoose.Types.ObjectId })._id || employee.companyId;

    const overlapping = await this.leaveRepository.findOverlappingLeaves(
      userId,
      input.startDate,
      input.endDate
    );

    if (overlapping.length > 0) {
      throw new ConflictError(
        `Overlapping leave request found for dates ${input.startDate} to ${input.endDate}`
      );
    }

    const totalDays = this.calculateTotalDays(input.startDate, input.endDate);

    const leave = await this.leaveRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: new mongoose.Types.ObjectId(companyId.toString()),
      employeeId: employee._id,
      leaveType: input.leaveType,
      startDate: input.startDate,
      endDate: input.endDate,
      totalDays,
      reason: input.reason,
      status: "PENDING",
    });

    const populated = await this.leaveRepository.findById(leave._id.toString());
    return populated || leave;
  }

  public async reviewLeave(
    leaveId: string,
    reviewerPayload: IJwtPayload,
    input: ReviewLeaveInput
  ): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request record not found");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequestError(`Leave request has already been ${leave.status}`);
    }

    if (reviewerPayload.role === ROLES.MANAGER) {
      const employee = await this.employeeRepository.findById(leave.employeeId.toString());
      if (!employee || !employee.managerId || employee.managerId.toString() !== reviewerPayload.userId) {
        throw new ForbiddenError("You are not authorized to review leave requests for this employee");
      }
    }

    const updated = await this.leaveRepository.updateStatus(
      leaveId,
      input.status,
      reviewerPayload.userId,
      input.reviewRemarks
    );

    if (!updated) {
      throw new BadRequestError("Failed to update leave request status");
    }

    return updated;
  }

  public async cancelLeave(leaveId: string, userId: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(leaveId);
    if (!leave) {
      throw new NotFoundError("Leave request record not found");
    }

    const leaveUserId = (leave.userId as { _id?: mongoose.Types.ObjectId })._id
      ? (leave.userId as { _id: mongoose.Types.ObjectId })._id.toString()
      : leave.userId.toString();

    if (leaveUserId !== userId) {
      throw new ForbiddenError("You can only cancel your own leave requests");
    }

    if (leave.status !== "PENDING") {
      throw new BadRequestError(`Cannot cancel leave request that is already ${leave.status}`);
    }

    const updated = await this.leaveRepository.updateStatus(leaveId, "CANCELLED");
    if (!updated) {
      throw new BadRequestError("Failed to cancel leave request");
    }

    return updated;
  }

  public async getUserLeaves(userId: string, year?: number, status?: LeaveStatus): Promise<ILeave[]> {
    return await this.leaveRepository.findByUser(userId, year, status);
  }

  public async getCompanyLeaves(companyId: string, status?: LeaveStatus, year?: number): Promise<ILeave[]> {
    return await this.leaveRepository.findByCompany(companyId, status, year);
  }

  public async getLeaveById(id: string): Promise<ILeave> {
    const leave = await this.leaveRepository.findById(id);
    if (!leave) {
      throw new NotFoundError("Leave request not found");
    }
    return leave;
  }
}
