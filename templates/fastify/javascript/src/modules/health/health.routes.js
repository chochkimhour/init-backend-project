const { healthController } = require("./health.controller");

async function healthRoutes(app) {
  app.get("/", healthController);
}

module.exports = healthRoutes;
