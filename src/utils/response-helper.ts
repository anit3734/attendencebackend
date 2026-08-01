import { NextResponse } from "next/server";
import { HTTP_STATUS, HttpStatusCode } from "@/constants/http-status";
import { IApiResponseSuccess, IApiResponseFailure } from "@/types/api-response";

export class ResponseHelper {
  public static success<T = unknown>(
    data: T,
    message = "Request processed successfully",
    statusCode: HttpStatusCode = HTTP_STATUS.OK
  ): NextResponse<IApiResponseSuccess<T>> {
    const body: IApiResponseSuccess<T> = {
      success: true,
      message,
      data,
      errors: null,
    };

    return NextResponse.json(body, { status: statusCode });
  }

  public static error(
    message = "An error occurred",
    statusCode: HttpStatusCode = HTTP_STATUS.INTERNAL_SERVER_ERROR,
    errors: Record<string, unknown> | Array<unknown> | string | null = {}
  ): NextResponse<IApiResponseFailure> {
    const body: IApiResponseFailure = {
      success: false,
      message,
      data: null,
      errors: errors ?? {},
    };

    return NextResponse.json(body, { status: statusCode });
  }
}
