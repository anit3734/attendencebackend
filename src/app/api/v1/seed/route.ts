import { NextResponse } from "next/server";
import { connectDB } from "@/config/db";
import { User } from "@/models/user.model";
import { Company } from "@/models/company.model";
import { Employee } from "@/models/employee.model";
import { PasswordUtil } from "@/utils/password.util";
import { ROLES } from "@/constants/roles";
import { HTTP_STATUS } from "@/constants/http-status";

export const runtime = "nodejs";

export const GET = async () => {
  try {
    await connectDB();

    // 1. Check or Create Company
    let company = await Company.findOne({ code: "APEX01" });
    if (!company) {
      company = await Company.create({
        name: "ApexWork Inc",
        code: "APEX01",
        office: {
          latitude: 28.629768,
          longitude: 77.37921,
          address: "Sector 63, Noida, Uttar Pradesh, India",
          radiusInMeters: 100,
        },
        settings: {
          shiftStartTime: "09:30",
          shiftEndTime: "18:30",
          gracePeriodInMinutes: 15,
          halfDayThresholdHours: 4,
          fullDayThresholdHours: 8,
          requireGeofence: false,
          allowRemoteClockIn: true,
        },
      });
    }

    // 2. Check or Create Admin User
    let user = await User.findOne({ email: "admin@company.com" });
    if (!user) {
      const hashedPassword = await PasswordUtil.hashPassword("admin123");
      user = await User.create({
        name: "System Administrator",
        email: "admin@company.com",
        password: hashedPassword,
        role: ROLES.COMPANY_ADMIN,
        companyId: company._id,
        isActive: true,
      });
    } else {
      // Update password to admin123 if user exists
      const hashedPassword = await PasswordUtil.hashPassword("admin123");
      user.password = hashedPassword;
      user.isActive = true;
      await user.save();
    }

    // 3. Check or Create Employee Profile
    let employee = await Employee.findOne({ userId: user._id });
    if (!employee) {
      employee = await Employee.create({
        userId: user._id,
        companyId: company._id,
        employeeId: "EMP001",
        designation: "System Administrator",
        department: "Management",
        joiningDate: new Date(),
        employmentType: "FULL_TIME",
        status: "ACTIVE",
        leaveBalances: {
          casual: 8,
          sick: 5,
          earned: 12,
        },
      });
    }

    return NextResponse.json(
      {
        success: true,
        message: "Database seeded successfully!",
        data: {
          company: company.name,
          adminUser: {
            email: user.email,
            password: "admin123",
            role: user.role,
          },
        },
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json(
      { success: false, message: error.message || "Failed to seed database" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
