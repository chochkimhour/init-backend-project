import type { Request, Response } from "express";
import { sendSuccess } from "../../common/http/response.js";
import { getHealthStatus } from "./health.service.js";

export function healthController(_req: Request, res: Response) {
  return sendSuccess(res, "API is running", getHealthStatus());
}
