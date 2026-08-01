import { NextResponse } from "next/server";
import { HealthService } from "@/services/health.service";
import { ResponseHelper } from "@/utils/response-helper";
import { HTTP_STATUS } from "@/constants/http-status";

export class HealthController {
  private healthService: HealthService;

  constructor() {
    this.healthService = new HealthService();
  }

  public getHealth = async (): Promise<NextResponse> => {
    const healthStatus = await this.healthService.getHealthStatus();

    const statusCode =
      healthStatus.status === "UP" ? HTTP_STATUS.OK : HTTP_STATUS.SERVICE_UNAVAILABLE;

    return ResponseHelper.success(
      healthStatus,
      healthStatus.status === "UP"
        ? "System is healthy and operational"
        : "System degradation detected: Database disconnected",
      statusCode
    );
  };
}
