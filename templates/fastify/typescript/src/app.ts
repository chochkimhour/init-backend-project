import Fastify from "fastify";
import cors from "@fastify/cors";
import { appConfig } from "./config/app.config.js";
import { registerRoutes } from "./modules/index.js";
import { registerErrorHandler } from "./common/plugins/error-handler.plugin.js";
import { registerNotFoundHandler } from "./common/plugins/not-found.plugin.js";

export async function buildApp() {
  const app = Fastify({
    logger: appConfig.env !== "test"
  });

  await app.register(cors, { origin: appConfig.corsOrigin });
  await registerRoutes(app);

  registerNotFoundHandler(app);
  registerErrorHandler(app);

  return app;
}
