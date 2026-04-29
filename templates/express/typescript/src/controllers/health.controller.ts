import type { Request, Response } from "express";
import { getHealthStatus } from "../services/health.service.js";
import { sendSuccess } from "../utils/response.js";

export function healthController(_req: Request, res: Response) {
  return sendSuccess(res, "API is running", getHealthStatus());
}
