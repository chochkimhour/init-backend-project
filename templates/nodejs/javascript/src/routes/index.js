const { healthRoutes } = require("./health.routes");
const { successResponse } = require("../utils/response");

async function handleRoutes(req, res) {
  if (req.url === "/" && req.method === "GET") {
    successResponse(res, "{{PROJECT_NAME}} API is running", {
      service: "{{PROJECT_NAME}}",
      health: "/health"
    });
    return true;
  }

  if (req.url === "/health" && req.method === "GET") {
    return healthRoutes(req, res);
  }

  return false;
}

module.exports = { handleRoutes };
