import type { IncomingMessage, ServerResponse } from "node:http";
import { errorResponse } from "../utils/response.js";
import { logger } from "../utils/logger.js";

interface HttpError extends Error {
  statusCode?: number;
}

export function errorMiddleware(error: unknown, _req: IncomingMessage, res: ServerResponse) {
  logger.error(error);

  if (res.headersSent) {
    return;
  }

  const httpError = error as HttpError;
  const statusCode = httpError.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal server error" : httpError.message;

  return errorResponse(res, message, statusCode);
}
