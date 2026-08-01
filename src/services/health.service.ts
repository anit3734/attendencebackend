import { connectDB } from "@/config/db";

export interface IHealthStatus {
  service: string;
  status: "UP" | "DOWN";
  timestamp: string;
  uptime: number;
  database: {
    status: "CONNECTED" | "DISCONNECTED" | "CONNECTING";
    dbName: string | null;
  };
}

export class HealthService {
  public async getHealthStatus(): Promise<IHealthStatus> {
    let dbStatus: "CONNECTED" | "DISCONNECTED" | "CONNECTING" = "DISCONNECTED";
    let dbName: string | null = null;

    try {
      // 3 second timeout guard so API request doesn't hang if MongoDB is unreachable
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("MongoDB Connection Timeout")), 3000)
      );

      const conn = await Promise.race([connectDB(), timeoutPromise]);
      if (conn.connection.readyState === 1) {
        dbStatus = "CONNECTED";
        dbName = conn.connection.name;
      } else if (conn.connection.readyState === 2) {
        dbStatus = "CONNECTING";
      }
    } catch {
      dbStatus = "DISCONNECTED";
    }

    return {
      service: "Attendance Management System API",
      status: dbStatus === "CONNECTED" ? "UP" : "DOWN",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      database: {
        status: dbStatus,
        dbName,
      },
    };
  }
}
