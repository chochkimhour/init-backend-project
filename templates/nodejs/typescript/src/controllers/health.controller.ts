import type { IncomingMessage, ServerResponse } from "node:http";
import { getHealthStatus } from "../services/health.service.js";
import { successResponse } from "../utils/response.js";

export async function healthController(_req: IncomingMessage, res: ServerResponse) {
  return successResponse(res, "API is running", getHealthStatus());
}
