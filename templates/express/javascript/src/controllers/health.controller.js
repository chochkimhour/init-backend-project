const { getHealthStatus } = require("../services/health.service");
const { sendSuccess } = require("../utils/response");

function healthController(_req, res) {
  return sendSuccess(res, "API is running", getHealthStatus());
}

module.exports = { healthController };
