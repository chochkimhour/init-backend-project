import type { ErrorRequestHandler } from "express";
import { sendError } from "../utils/response.js";
import { logger } from "../utils/logger.js";

interface HttpError extends Error {
  statusCode?: number;
}

export const errorMiddleware: ErrorRequestHandler = (error: HttpError, _req, res, _next) => {
  logger.error(error);

  const statusCode = error.statusCode ?? 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  return sendError(res, message, statusCode);
};
