import type { IncomingMessage, ServerResponse } from "node:http";
import { errorResponse } from "../utils/response.js";

export function notFoundMiddleware(req: IncomingMessage, res: ServerResponse) {
  return errorResponse(res, `Route ${req.method} ${req.url} not found`, 404);
}
