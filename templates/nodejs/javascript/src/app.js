const { handleRoutes } = require("./routes");
const { errorMiddleware } = require("./middlewares/error.middleware");
const { notFoundMiddleware } = require("./middlewares/not-found.middleware");
const { appConfig } = require("./config/app.config");
const { logger } = require("./utils/logger");

async function app(req, res) {
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

function setCorsHeaders(res) {
  res.setHeader("Access-Control-Allow-Origin", appConfig.corsOrigin);
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
}

function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method || "")) {
      resolve(undefined);
      return;
    }

    let rawBody = "";
    req.on("data", (chunk) => {
      rawBody += chunk;
    });
    req.on("end", () => {
      if (!rawBody) {
        resolve(undefined);
        return;
      }

      try {
        resolve(JSON.parse(rawBody));
      } catch {
        reject(Object.assign(new Error("Invalid JSON body"), { statusCode: 400 }));
      }
    });
    req.on("error", reject);
  });
}

module.exports = { app };
