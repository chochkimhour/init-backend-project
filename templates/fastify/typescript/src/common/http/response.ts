export function successResponse<T extends Record<string, unknown>>(message: string, data = {} as T) {
  return {
    success: true,
    message,
    ...data
  };
}

export function errorResponse(message: string, details?: unknown) {
  return {
    success: false,
    message,
    ...(details ? { details } : {})
  };
}
