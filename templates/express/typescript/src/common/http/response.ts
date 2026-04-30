import type { Response } from "express";

export function sendSuccess<T extends Record<string, unknown>>(
  res: Response,
  message: string,
  data = {} as T,
  statusCode = 200
) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

export function sendError(res: Response, message: string, statusCode = 500, details?: unknown) {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(details ? { details } : {})
  });
}
