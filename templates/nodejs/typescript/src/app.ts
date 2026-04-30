import type { IncomingMessage, ServerResponse } from "node:http";
import { handleRoutes } from "./modules/index.js";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware.js";
import { appConfig } from "./config/app.config.js";
import { logger } from "./common/utils/logger.js";

export async function app(req: IncomingMessage & { body?: unknown }, res: ServerResponse) {
  try {
    setCorsHeaders(res);

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      res.end();
      return;
    }

    logger.info(`[{{PROJECT_NAME}}] ${req.method} ${req.url}`);
    req.body = await parseJsonBody(req);

    const handled = await handleRoutes(req, res);
    if (!handled) {
      notFoundMiddleware(req, res);
    }
  } catch (error) {
    errorMiddleware(error, req, res);
  }
}

function setCorsHeaders(res: ServerResponse) {
  res.setHeader("Access-Control-Allow-Origin", appConfig.corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function parseJsonBody(req: IncomingMessage) {
  return new Promise<unknown>((resolve, reject) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method ?? "")) {
      resolve(undefined);
      return;
    }

    let rawBody = "";
    req.on("data", (chunk: Buffer) => {
      rawBody += chunk.toString("utf8");
    });
    req.on("end", () => {
      if (!rawBody) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(rawBody) as unknown);
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}
