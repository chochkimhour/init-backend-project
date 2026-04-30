import { buildApp } from "./app.js";
import { appConfig } from "./config/app.config.js";

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: appConfig.port, host: "0.0.0.0" });
    app.log.info(`[{{PROJECT_NAME}}] Fastify API running on http://localhost:${appConfig.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

void start();
