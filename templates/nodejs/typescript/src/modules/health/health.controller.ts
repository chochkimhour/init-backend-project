import type { IncomingMessage, ServerResponse } from "node:http";
import { successResponse } from "../../common/http/response.js";
import { getHealthStatus } from "./health.service.js";

export async function healthController(_req: IncomingMessage, res: ServerResponse) {
  return successResponse(res, "API is running", getHealthStatus());
}
