import Fastify from "fastify";
import cors from "@fastify/cors";
import { appConfig } from "./config/app.config.js";
import { registerRoutes } from "./routes/index.js";
import { registerErrorHandler } from "./middlewares/error.middleware.js";
import { registerNotFoundHandler } from "./middlewares/not-found.middleware.js";

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
