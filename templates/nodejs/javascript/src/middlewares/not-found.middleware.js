const { errorResponse } = require("../utils/response");

function notFoundMiddleware(req, res) {
  return errorResponse(res, `Route ${req.method} ${req.url} not found`, 404);
}

module.exports = { notFoundMiddleware };
