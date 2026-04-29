const { sendError } = require("../utils/response");

function notFoundMiddleware(req, res) {
  return sendError(res, `Route ${req.method} ${req.originalUrl} not found`, 404);
}

module.exports = { notFoundMiddleware };
