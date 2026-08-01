import { Attendance, IAttendance, IClockOutRecord, DayStatus } from "@/models/attendance.model";
import { connectDB } from "@/config/db";
import mongoose from "mongoose";

export class AttendanceRepository {
  public async create(attendanceData: Partial<IAttendance>): Promise<IAttendance> {
    await connectDB();
    const attendance = new Attendance(attendanceData);
    return await attendance.save();
  }

  public async findByUserAndDate(userId: string, date: string): Promise<IAttendance | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }
    return await Attendance.findOne({
      userId: new mongoose.Types.ObjectId(userId),
      date,
    })
      .populate("userId", "name email role")
      .populate("companyId", "name code office settings")
      .populate("employeeId", "employeeId designation department")
      .exec();
  }

  public async findById(id: string): Promise<IAttendance | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Attendance.findById(id).exec();
  }

  public async updateClockOut(
    id: string,
    clockOut: IClockOutRecord,
    workingHours: number,
    status: DayStatus
  ): Promise<IAttendance | null> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return await Attendance.findByIdAndUpdate(
      id,
      {
        $set: {
          clockOut,
          workingHours,
          status,
        },
      },
      { new: true }
    )
      .populate("userId", "name email role")
      .populate("employeeId", "employeeId designation department")
      .exec();
  }

  public async findUserHistory(
    userId: string,
    startDate?: string,
    endDate?: string
  ): Promise<IAttendance[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return [];
    }

    const query: Record<string, unknown> = {
      userId: new mongoose.Types.ObjectId(userId),
    };

    if (startDate || endDate) {
      query.date = {};
      if (startDate) (query.date as Record<string, string>).$gte = startDate;
      if (endDate) (query.date as Record<string, string>).$lte = endDate;
    }

    return await Attendance.find(query)
      .sort({ date: -1 })
      .exec();
  }

  public async findCompanyToday(companyId: string, date: string): Promise<IAttendance[]> {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    return await Attendance.find({
      companyId: new mongoose.Types.ObjectId(companyId),
      date,
    })
      .populate("userId", "name email role")
      .populate("employeeId", "employeeId designation department")
      .sort({ "clockIn.time": 1 })
      .exec();
  }

  public async getUserMonthlySummary(userId: string, startDate: string, endDate: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return null;
    }

    const attendanceStats = await Attendance.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalPresent: {
            $sum: { $cond: [{ $in: ["$status", ["PRESENT", "LATE", "HALF_DAY"]] }, 1, 0] },
          },
          onTimeArrivals: {
            $sum: { $cond: [{ $eq: ["$clockIn.status", "ON_TIME"] }, 1, 0] },
          },
          lateArrivals: {
            $sum: { $cond: [{ $eq: ["$clockIn.status", "LATE"] }, 1, 0] },
          },
          totalWorkingHours: { $sum: "$workingHours" },
        },
      },
    ]);

    return attendanceStats[0] || {
      totalPresent: 0,
      onTimeArrivals: 0,
      lateArrivals: 0,
      totalWorkingHours: 0,
    };
  }

  public async getSummaryData(companyId: string, startDate: string, endDate: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    return await Attendance.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
          totalWorkingHours: { $sum: "$workingHours" },
        },
      },
    ]);
  }

  public async getPayrollReportData(companyId: string, startDate: string, endDate: string) {
    await connectDB();
    if (!mongoose.Types.ObjectId.isValid(companyId)) {
      return [];
    }

    return await Attendance.aggregate([
      {
        $match: {
          companyId: new mongoose.Types.ObjectId(companyId),
          date: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: "$userId",
          employeeIdDoc: { $first: "$employeeId" },
          totalWorkingHours: { $sum: "$workingHours" },
          presentDays: {
            $sum: { $cond: [{ $in: ["$status", ["PRESENT", "ON_TIME"]] }, 1, 0] },
          },
          lateDays: {
            $sum: { $cond: [{ $eq: ["$status", "LATE"] }, 1, 0] },
          },
          halfDays: {
            $sum: { $cond: [{ $eq: ["$status", "HALF_DAY"] }, 1, 0] },
          },
          absentDays: {
            $sum: { $cond: [{ $eq: ["$status", "ABSENT"] }, 1, 0] },
          },
          onLeaveDays: {
            $sum: { $cond: [{ $eq: ["$status", "ON_LEAVE"] }, 1, 0] },
          },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "user",
        },
      },
      {
        $unwind: "$user",
      },
      {
        $lookup: {
          from: "employees",
          localField: "employeeIdDoc",
          foreignField: "_id",
          as: "employee",
        },
      },
      {
        $unwind: { path: "$employee", preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          userId: "$_id",
          name: "$user.name",
          email: "$user.email",
          employeeCode: "$employee.employeeId",
          designation: "$employee.designation",
          department: "$employee.department",
          totalWorkingHours: { $round: ["$totalWorkingHours", 2] },
          presentDays: 1,
          lateDays: 1,
          halfDays: 1,
          absentDays: 1,
          onLeaveDays: 1,
          payableDays: {
            $add: [
              "$presentDays",
              "$lateDays",
              "$onLeaveDays",
              { $multiply: ["$halfDays", 0.5] },
            ],
          },
        },
      },
    ]);
  }
}
