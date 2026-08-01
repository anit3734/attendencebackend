import { AttendanceRepository } from "@/repositories/attendance.repository";
import { EmployeeRepository } from "@/repositories/employee.repository";
import { CompanyRepository } from "@/repositories/company.repository";
import { GeofenceUtil } from "@/utils/geofence.util";
import { ClockInInput, ClockOutInput } from "@/validations/attendance.validation";
import { BadRequestError, NotFoundError, ConflictError } from "@/errors/app-error";
import { IAttendance, CLOCK_IN_STATUS, DAY_STATUS, DayStatus } from "@/models/attendance.model";
import { Leave } from "@/models/leave.model";
import mongoose from "mongoose";

export class AttendanceService {
  private attendanceRepository: AttendanceRepository;
  private employeeRepository: EmployeeRepository;
  private companyRepository: CompanyRepository;

  constructor() {
    this.attendanceRepository = new AttendanceRepository();
    this.employeeRepository = new EmployeeRepository();
    this.companyRepository = new CompanyRepository();
  }

  private getTodayDateString(): string {
    const now = new Date();
    return now.toISOString().split("T")[0]; // YYYY-MM-DD
  }

  public async clockIn(userId: string, input: ClockInInput): Promise<IAttendance> {
    const employee = await this.employeeRepository.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError("Employee profile not found for this user");
    }

    if (employee.status !== "ACTIVE") {
      throw new BadRequestError(`Cannot clock in. Employee status is ${employee.status}`);
    }

    const companyIdStr = (employee.companyId as { _id?: mongoose.Types.ObjectId })._id
      ? (employee.companyId as { _id: mongoose.Types.ObjectId })._id.toString()
      : employee.companyId.toString();

    const company = await this.companyRepository.findById(companyIdStr);
    if (!company) {
      throw new NotFoundError("Company profile not found");
    }

    const todayDateStr = this.getTodayDateString();

    const existingAttendance = await this.attendanceRepository.findByUserAndDate(userId, todayDateStr);
    if (existingAttendance) {
      throw new ConflictError("You have already clocked in today");
    }

    // Geofencing verification
    const distanceInMeters = GeofenceUtil.calculateDistance(
      input.latitude,
      input.longitude,
      company.office.latitude,
      company.office.longitude
    );

    if (company.settings.requireGeofence && !company.settings.allowRemoteClockIn) {
      if (distanceInMeters > company.office.radiusInMeters) {
        throw new BadRequestError(
          `Outside office geofence radius. Current distance: ${distanceInMeters}m (Allowed: ${company.office.radiusInMeters}m)`
        );
      }
    }

    // Determine ON_TIME vs LATE status
    const now = new Date();
    const [shiftHour, shiftMinute] = company.settings.shiftStartTime.split(":").map(Number);
    const shiftTime = new Date(now);
    shiftTime.setHours(shiftHour, shiftMinute, 0, 0);

    const graceEndTime = new Date(shiftTime.getTime() + company.settings.gracePeriodInMinutes * 60 * 1000);
    const clockInStatus = now <= graceEndTime ? CLOCK_IN_STATUS.ON_TIME : CLOCK_IN_STATUS.LATE;
    const initialDayStatus = clockInStatus === CLOCK_IN_STATUS.LATE ? DAY_STATUS.LATE : DAY_STATUS.PRESENT;

    const attendance = await this.attendanceRepository.create({
      userId: new mongoose.Types.ObjectId(userId),
      companyId: company._id,
      employeeId: employee._id,
      date: todayDateStr,
      clockIn: {
        time: now,
        location: {
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          distanceInMeters,
        },
        deviceInfo: input.deviceInfo,
        status: clockInStatus,
        remarks: input.remarks,
      },
      status: initialDayStatus,
      workingHours: 0,
      overtimeHours: 0,
      isApproved: true,
    });

    const populated = await this.attendanceRepository.findByUserAndDate(userId, todayDateStr);
    return populated || attendance;
  }

  public async clockOut(userId: string, input: ClockOutInput): Promise<IAttendance> {
    const employee = await this.employeeRepository.findByUserId(userId);
    if (!employee) {
      throw new NotFoundError("Employee profile not found");
    }

    const companyIdStr = (employee.companyId as { _id?: mongoose.Types.ObjectId })._id
      ? (employee.companyId as { _id: mongoose.Types.ObjectId })._id.toString()
      : employee.companyId.toString();

    const company = await this.companyRepository.findById(companyIdStr);
    if (!company) {
      throw new NotFoundError("Company profile not found");
    }

    const todayDateStr = this.getTodayDateString();
    const attendance = await this.attendanceRepository.findByUserAndDate(userId, todayDateStr);

    if (!attendance) {
      throw new BadRequestError("You have not clocked in today");
    }

    if (attendance.clockOut && attendance.clockOut.time) {
      throw new ConflictError("You have already clocked out today");
    }

    const distanceInMeters = GeofenceUtil.calculateDistance(
      input.latitude,
      input.longitude,
      company.office.latitude,
      company.office.longitude
    );

    const clockOutTime = new Date();
    const clockInTime = new Date(attendance.clockIn.time);

    const durationMs = clockOutTime.getTime() - clockInTime.getTime();
    const workingHours = parseFloat((durationMs / (1000 * 60 * 60)).toFixed(2));

    let finalDayStatus: DayStatus = attendance.status;
    if (workingHours < company.settings.halfDayThresholdHours) {
      finalDayStatus = DAY_STATUS.HALF_DAY;
    } else if (workingHours >= company.settings.fullDayThresholdHours) {
      finalDayStatus = attendance.clockIn.status === CLOCK_IN_STATUS.LATE ? DAY_STATUS.LATE : DAY_STATUS.PRESENT;
    }

    const updated = await this.attendanceRepository.updateClockOut(
      attendance._id.toString(),
      {
        time: clockOutTime,
        location: {
          latitude: input.latitude,
          longitude: input.longitude,
          address: input.address,
          distanceInMeters,
        },
        deviceInfo: input.deviceInfo,
        remarks: input.remarks,
      },
      workingHours,
      finalDayStatus
    );

    if (!updated) {
      throw new BadRequestError("Failed to record clock out");
    }

    return updated;
  }

  public async getTodayAttendance(userId: string): Promise<IAttendance | null> {
    const todayDateStr = this.getTodayDateString();
    return await this.attendanceRepository.findByUserAndDate(userId, todayDateStr);
  }

  public async getAttendanceHistory(userId: string, startDate?: string, endDate?: string): Promise<IAttendance[]> {
    return await this.attendanceRepository.findUserHistory(userId, startDate, endDate);
  }

  public async getCompanyTodayAttendance(companyId: string): Promise<IAttendance[]> {
    const todayDateStr = this.getTodayDateString();
    return await this.attendanceRepository.findCompanyToday(companyId, todayDateStr);
  }

  public async getAttendanceSummary(companyId?: string, month?: number, year?: number, userId?: string) {
    const now = new Date();
    const selectedYear = year || now.getFullYear();
    const selectedMonth = month || now.getMonth() + 1;

    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    let summaryData: any[] = [];
    if (companyId) {
      summaryData = await this.attendanceRepository.getSummaryData(companyId, startDate, endDate);
    }

    let userMetrics = null;
    if (userId) {
      const metrics = await this.attendanceRepository.getUserMonthlySummary(userId, startDate, endDate);
      const employee = await this.employeeRepository.findByUserId(userId);
      
      // Calculate actual approved leaves this month
      const monthPrefix = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}`;
      const approvedLeaves = await Leave.find({
        userId: new mongoose.Types.ObjectId(userId),
        status: "APPROVED",
        $or: [
          { startDate: { $regex: `^${monthPrefix}` } },
          { endDate: { $regex: `^${monthPrefix}` } }
        ]
      });
      const leaveThisMonth = approvedLeaves.reduce((sum, leave) => sum + leave.totalDays, 0);

      userMetrics = {
        presentDays: metrics?.totalPresent || 0,
        totalMonthDays: lastDay,
        leaveThisMonth,
        leaveRemaining: 30.0, // Legacy fallback
        leaveBalances: employee?.leaveBalances || { casual: 8, sick: 5, earned: 12 },
        onTimeArrivals: metrics?.onTimeArrivals || 0,
        lateArrivals: metrics?.lateArrivals || 0,
      };
    }

    return {
      period: { startDate, endDate, totalDays: lastDay },
      userMetrics,
      totalRecords: summaryData.reduce((acc: number, curr: { count: number }) => acc + curr.count, 0),
      byStatus: summaryData.reduce((acc: Record<string, { count: number; totalWorkingHours: number }>, curr: { _id: string; count: number; totalWorkingHours: number }) => {
        acc[curr._id] = { count: curr.count, totalWorkingHours: parseFloat(curr.totalWorkingHours.toFixed(2)) };
        return acc;
      }, {}),
    };
  }

  public async getPayrollReport(companyId: string, month?: number, year?: number) {
    const now = new Date();
    const selectedYear = year || now.getFullYear();
    const selectedMonth = month || now.getMonth() + 1;

    const startDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-01`;
    const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();
    const endDate = `${selectedYear}-${String(selectedMonth).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const reportData = await this.attendanceRepository.getPayrollReportData(companyId, startDate, endDate);

    return {
      period: { year: selectedYear, month: selectedMonth, totalDays: lastDay, startDate, endDate },
      totalEmployees: reportData.length,
      employees: reportData,
    };
  }

  public async offlineSync(
    userId: string,
    records: Array<{
      type: "CLOCK_IN" | "CLOCK_OUT";
      offlineTime: string;
      latitude: number;
      longitude: number;
      address?: string;
      deviceInfo?: string;
      remarks?: string;
    }>
  ) {
    const results = [];
    for (const record of records) {
      if (record.type === "CLOCK_IN") {
        try {
          const res = await this.clockIn(userId, {
            latitude: record.latitude,
            longitude: record.longitude,
            address: record.address,
            deviceInfo: record.deviceInfo,
            remarks: record.remarks ? `Offline Sync: ${record.remarks}` : "Offline Sync",
          });
          results.push({ status: "SUCCESS", type: "CLOCK_IN", data: res });
        } catch (err: any) {
          results.push({ status: "FAILED", type: "CLOCK_IN", error: err.message });
        }
      } else if (record.type === "CLOCK_OUT") {
        try {
          const res = await this.clockOut(userId, {
            latitude: record.latitude,
            longitude: record.longitude,
            address: record.address,
            deviceInfo: record.deviceInfo,
            remarks: record.remarks ? `Offline Sync: ${record.remarks}` : "Offline Sync",
          });
          results.push({ status: "SUCCESS", type: "CLOCK_OUT", data: res });
        } catch (err: any) {
          results.push({ status: "FAILED", type: "CLOCK_OUT", error: err.message });
        }
      }
    }
    return results;
  }
}
