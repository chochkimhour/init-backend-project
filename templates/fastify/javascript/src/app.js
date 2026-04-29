const Fastify = require("fastify");
const cors = require("@fastify/cors");
const { appConfig } = require("./config/app.config");
const { registerRoutes } = require("./modules");
const { registerErrorHandler } = require("./common/plugins/error-handler.plugin");
const { registerNotFoundHandler } = require("./common/plugins/not-found.plugin");

async function buildApp() {
  const app = Fastify({
    logger: appConfig.env !== "test"
  });

  await app.register(cors, { origin: appConfig.corsOrigin });
  await registerRoutes(app);

  registerNotFoundHandler(app);
  registerErrorHandler(app);

  return app;
}

module.exports = { buildApp };
