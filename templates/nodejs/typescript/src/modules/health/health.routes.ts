import type { IncomingMessage, ServerResponse } from "node:http";
import { healthController } from "./health.controller.js";

export async function healthRoutes(req: IncomingMessage, res: ServerResponse) {
  return healthController(req, res);
}
