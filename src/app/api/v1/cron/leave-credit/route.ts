import { NextResponse } from "next/server";
import { Employee } from "@/models/employee.model";
import { connectDB } from "@/config/db";
import { HTTP_STATUS } from "@/constants/http-status";

export const runtime = "nodejs";

export const POST = async (req: Request) => {
  try {
    // Basic Security: Check for a Cron Secret in the headers
    // In production, you would set CRON_SECRET in your .env
    const authHeader = req.headers.get("Authorization");
    const expectedSecret = `Bearer ${process.env.CRON_SECRET || 'super-secret-cron-key'}`;
    
    if (authHeader !== expectedSecret) {
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: HTTP_STATUS.UNAUTHORIZED });
    }

    await connectDB();

    // Increment EL (Earned Leave) by 1.5 for all ACTIVE employees
    const result = await Employee.updateMany(
      { status: "ACTIVE" },
      { $inc: { "leaveBalances.earned": 1.5 } }
    );

    return NextResponse.json(
      {
        success: true,
        message: "Leave credit engine executed successfully",
        data: {
          employeesUpdated: result.modifiedCount,
          creditAdded: 1.5,
          leaveType: "Earned Leave (EL)"
        },
      },
      { status: HTTP_STATUS.OK }
    );
  } catch (error: any) {
    console.error("Leave credit engine error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: HTTP_STATUS.INTERNAL_SERVER_ERROR }
    );
  }
};
