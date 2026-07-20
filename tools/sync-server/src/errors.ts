export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
}

export function makeErrorResponse(
  code: string,
  message: string
): ApiErrorResponse {
  return {
    success: false,
    error: {
      code,
      message,
    },
  };
}

export function makeSuccessResponse<T>(
  data?: T,
  message?: string
): ApiSuccessResponse<T> {
  const res: ApiSuccessResponse<T> = { success: true };
  if (data !== undefined) res.data = data;
  if (message !== undefined) res.message = message;
  return res;
}
