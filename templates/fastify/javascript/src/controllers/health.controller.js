const { getHealthStatus } = require("../services/health.service");
const { successResponse } = require("../utils/response");

async function healthController(_request, reply) {
  return reply.send(successResponse("API is running", getHealthStatus()));
}

module.exports = { healthController };
