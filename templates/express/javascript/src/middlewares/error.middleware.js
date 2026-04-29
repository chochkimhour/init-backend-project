const { sendError } = require("../utils/response");
const { logger } = require("../utils/logger");

function errorMiddleware(error, _req, res, _next) {
  logger.error(error);

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  return sendError(res, message, statusCode);
}

module.exports = { errorMiddleware };
