import type { Request, Response } from "express";
import { sendError } from "../utils/response.js";

export function notFoundMiddleware(req: Request, res: Response) {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}
