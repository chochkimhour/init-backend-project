import type { IncomingMessage, ServerResponse } from "node:http";
import { successResponse } from "../common/http/response.js";
import { healthRoutes } from "./health/health.routes.js";

export async function handleRoutes(req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/" && req.method === "GET") {
    successResponse(res, "{{PROJECT_NAME}} Node.js API is running", {
      service: "{{PROJECT_NAME}}",
      framework: "Node.js",
      health: "/health"
    });
    return true;
  }

  if (req.url === "/health" && req.method === "GET") {
    await healthRoutes(req, res);
    return true;
  }

  return false;
}
