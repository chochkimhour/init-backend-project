import type { IncomingMessage, ServerResponse } from "node:http";
import { healthController } from "../controllers/health.controller.js";

export async function healthRoutes(req: IncomingMessage, res: ServerResponse) {
  return healthController(req, res);
}
