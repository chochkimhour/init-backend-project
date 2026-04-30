import type { IncomingMessage, ServerResponse } from "node:http";
import { errorResponse } from "../http/response.js";

export function notFoundMiddleware(req: IncomingMessage, res: ServerResponse) {
  if (res.headersSent) {
    return;
  }

  return errorResponse(res, `Route ${req.method} ${req.url} not found`, 404);
}
