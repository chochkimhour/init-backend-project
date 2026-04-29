const Fastify = require("fastify");
const cors = require("@fastify/cors");
const { appConfig } = require("./config/app.config");
const registerRoutes = require("./routes");
const { registerErrorHandler } = require("./middlewares/error.middleware");
const { registerNotFoundHandler } = require("./middlewares/not-found.middleware");

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
