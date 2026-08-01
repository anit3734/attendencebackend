import { RegularizationRepository } from "@/repositories/regularization.repository";
import { EmployeeRepository } from "@/repositories/employee.repository";
import { AttendanceRepository } from "@/repositories/attendance.repository";
import { NotificationRepository } from "@/repositories/notification.repository";
import { AppError } from "@/errors/app-error";
import { HTTP_STATUS } from "@/constants/http-status";
import { CLOCK_IN_STATUS, DAY_STATUS } from "@/models/attendance.model";
import mongoose from "mongoose";

export class RegularizationService {
  private regularizationRepo: RegularizationRepository;
  private employeeRepo: EmployeeRepository;
  private attendanceRepo: AttendanceRepository;
  private notificationRepo: NotificationRepository;

  constructor() {
    this.regularizationRepo = new RegularizationRepository();
    this.employeeRepo = new EmployeeRepository();
    this.attendanceRepo = new AttendanceRepository();
    this.notificationRepo = new NotificationRepository();
  }

  public async applyRegularization(
    userId: string,
    data: {
      date: string;
      requestedClockIn?: string;
      requestedClockOut?: string;
      reason: string;
    }
  ) {
    const employee = await this.employeeRepo.findByUserId(userId);
    if (!employee) {
      throw new AppError("Employee profile not found", HTTP_STATUS.NOT_FOUND);
    }

    const companyIdStr = (employee.companyId as any)?._id?.toString() || employee.companyId.toString();

    const existing = await this.regularizationRepo.findExisting(userId, data.date);
    if (existing) {
      throw new AppError(
        "A pending or approved regularization request already exists for this date",
        HTTP_STATUS.CONFLICT
      );
    }

    const request = await this.regularizationRepo.create({
      companyId: companyIdStr as any,
      employeeId: employee._id as any,
      userId: userId as any,
      date: data.date,
      requestedClockIn: data.requestedClockIn || new Date(`${data.date}T09:30:00.000Z`).toISOString(),
      requestedClockOut: data.requestedClockOut || new Date(`${data.date}T18:30:00.000Z`).toISOString(),
      reason: data.reason,
      status: "PENDING",
    });

    return request;
  }

  public async getUserRegularizations(userId: string) {
    return await this.regularizationRepo.findByUser(userId);
  }

  public async getCompanyRegularizations(companyId: string, status?: string) {
    return await this.regularizationRepo.findByCompany(companyId, status);
  }

  public async reviewRegularization(
    requestId: string,
    reviewerUserId: string,
    data: {
      status: "APPROVED" | "REJECTED";
      reviewRemarks?: string;
    }
  ) {
    const request = await this.regularizationRepo.findById(requestId);
    if (!request) {
      throw new AppError("Regularization request not found", HTTP_STATUS.NOT_FOUND);
    }

    if (request.status !== "PENDING") {
      throw new AppError("Request has already been reviewed", HTTP_STATUS.BAD_REQUEST);
    }

    const updated = await this.regularizationRepo.updateStatus(
      requestId,
      data.status,
      reviewerUserId,
      data.reviewRemarks
    );

    if (data.status === "APPROVED") {
      const companyIdStr = request.companyId.toString();
      const employeeIdStr = request.employeeId.toString();
      const userIdStr = request.userId.toString();

      let attendance = await this.attendanceRepo.findByUserAndDate(userIdStr, request.date);

      const clockInTime = request.requestedClockIn ? new Date(request.requestedClockIn) : new Date(`${request.date}T09:30:00.000Z`);
      const clockOutTime = request.requestedClockOut ? new Date(request.requestedClockOut) : new Date(`${request.date}T18:30:00.000Z`);
      const workingHours = Math.max(0, parseFloat(((clockOutTime.getTime() - clockInTime.getTime()) / (1000 * 60 * 60)).toFixed(2)));

      const clockInLocation = {
        latitude: 28.629768,
        longitude: 77.379210,
        address: "Regularized Shift",
        distanceInMeters: 0,
      };

      if (!attendance) {
        await this.attendanceRepo.create({
          companyId: new mongoose.Types.ObjectId(companyIdStr),
          employeeId: new mongoose.Types.ObjectId(employeeIdStr),
          userId: new mongoose.Types.ObjectId(userIdStr),
          date: request.date,
          status: DAY_STATUS.PRESENT,
          clockIn: {
            time: clockInTime,
            location: clockInLocation,
            status: CLOCK_IN_STATUS.ON_TIME,
            remarks: `Regularized: ${request.reason}`,
          },
          clockOut: {
            time: clockOutTime,
            location: clockInLocation,
            remarks: "Regularization Approved",
          },
          workingHours,
          overtimeHours: 0,
          isApproved: true,
        });
      } else {
        attendance.status = DAY_STATUS.PRESENT;
        attendance.clockIn = {
          time: clockInTime,
          location: clockInLocation,
          status: CLOCK_IN_STATUS.ON_TIME,
          remarks: `Regularized: ${request.reason}`,
        };
        attendance.clockOut = {
          time: clockOutTime,
          location: clockInLocation,
          remarks: "Regularization Approved",
        };
        attendance.workingHours = workingHours;
        await attendance.save();
      }
    }

    await this.notificationRepo.create({
      companyId: request.companyId as any,
      userId: request.userId as any,
      title: `Attendance Regularization ${data.status}`,
      body: `Your attendance correction request for ${request.date} has been ${data.status.toLowerCase()}`,
      type: "SYSTEM",
    });

    return updated;
  }
}
