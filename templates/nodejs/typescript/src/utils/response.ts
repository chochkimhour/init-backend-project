import type { ServerResponse } from "node:http";

function sendJson(res: ServerResponse, statusCode: number, payload: Record<string, unknown>) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json"
  });
  res.end(JSON.stringify(payload));
}

export function successResponse<T extends Record<string, unknown>>(
  res: ServerResponse,
  message: string,
  data = {} as T,
  statusCode = 200
) {
  return sendJson(res, statusCode, {
    success: true,
    message,
    ...data
  });
}

export function errorResponse(res: ServerResponse, message: string, statusCode = 500, details?: unknown) {
  return sendJson(res, statusCode, {
    success: false,
    message,
    ...(details ? { details } : {})
  });
}
