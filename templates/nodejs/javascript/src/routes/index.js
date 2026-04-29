const { healthRoutes } = require("./health.routes");

async function handleRoutes(req, res) {
  if (req.url === "/health" && req.method === "GET") {
    return healthRoutes(req, res);
  }

  return false;
}

module.exports = { handleRoutes };
