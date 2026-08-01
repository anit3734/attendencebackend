export interface IApiResponseSuccess<T = unknown> {
  success: true;
  message: string;
  data: T;
  errors: null;
}

export interface IApiResponseFailure {
  success: false;
  message: string;
  data: null;
  errors: Record<string, unknown> | Array<unknown> | string | null;
}

export type ApiResponse<T = unknown> = IApiResponseSuccess<T> | IApiResponseFailure;
