import type { IncomingMessage, ServerResponse } from "node:http";
import { healthRoutes } from "./health.routes.js";
import { successResponse } from "../utils/response.js";

export async function handleRoutes(req: IncomingMessage, res: ServerResponse) {
  if (req.url === "/" && req.method === "GET") {
    successResponse(res, "{{PROJECT_NAME}} API is running", {
      service: "{{PROJECT_NAME}}",
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
