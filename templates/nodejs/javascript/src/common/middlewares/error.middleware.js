const { errorResponse } = require("../http/response");
const { logger } = require("../utils/logger");

function errorMiddleware(error, _req, res) {
  logger.error(error);

  if (res.headersSent) {
    return;
  }

  const statusCode = error.statusCode || 500;
  const message = statusCode === 500 ? "Internal server error" : error.message;

  return errorResponse(res, message, statusCode);
}

module.exports = { errorMiddleware };
