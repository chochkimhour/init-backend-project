const { healthController } = require("../controllers/health.controller");

async function healthRoutes(app) {
  app.get("/", healthController);
}

module.exports = healthRoutes;
