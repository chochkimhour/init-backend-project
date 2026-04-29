import type { IncomingMessage, ServerResponse } from "node:http";
import { healthRoutes } from "./health.routes.js";

export async function handleRoutes(req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/health" && req.method === "GET") {
    await healthRoutes(req, res);
    return true;
  }

  return false;
}
