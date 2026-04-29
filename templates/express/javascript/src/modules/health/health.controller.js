const { sendSuccess } = require("../../common/http/response");
const { getHealthStatus } = require("./health.service");

function healthController(_req, res) {
  return sendSuccess(res, "API is running", getHealthStatus());
}

module.exports = { healthController };
