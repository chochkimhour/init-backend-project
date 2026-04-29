const healthRoutes = require("./health.routes");

async function registerRoutes(app) {
  await app.register(healthRoutes, { prefix: "/health" });
}

module.exports = registerRoutes;
