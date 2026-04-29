const { healthController } = require("./health.controller");

async function healthRoutes(req, res) {
  return healthController(req, res);
}

module.exports = { healthRoutes };
