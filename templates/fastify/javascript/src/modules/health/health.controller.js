const { successResponse } = require("../../common/http/response");
const { getHealthStatus } = require("./health.service");

async function healthController(_request, reply) {
  return reply.send(successResponse("API is running", getHealthStatus()));
}

module.exports = { healthController };
