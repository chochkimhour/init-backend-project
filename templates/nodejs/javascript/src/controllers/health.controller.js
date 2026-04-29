const { getHealthStatus } = require("../services/health.service");
const { successResponse } = require("../utils/response");

async function healthController(_req, res) {
  return successResponse(res, "API is running", getHealthStatus());
}

module.exports = { healthController };
