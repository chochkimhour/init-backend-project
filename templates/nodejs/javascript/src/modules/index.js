const { successResponse } = require("../common/http/response");
const { healthRoutes } = require("./health/health.routes");

async function handleRoutes(req, res) {
  if (req.url === "/" && req.method === "GET") {
    successResponse(res, "{{PROJECT_NAME}} API is running", {
      service: "{{PROJECT_NAME}}",
      health: "/health"
    });
    return true;
  }

  if (req.url === "/health" && req.method === "GET") {
    await healthRoutes(req, res);
    return true;
  }

  return false;
}

module.exports = { handleRoutes };
