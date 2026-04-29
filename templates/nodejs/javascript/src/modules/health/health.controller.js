const { successResponse } = require("../../common/http/response");
const { getHealthStatus } = require("./health.service");

async function healthController(_req, res) {
  return successResponse(res, "API is running", getHealthStatus());
}

module.exports = { healthController };
