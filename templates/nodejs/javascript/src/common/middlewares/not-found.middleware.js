const { errorResponse } = require("../http/response");

function notFoundMiddleware(req, res) {
  if (res.headersSent) {
    return;
  }

  return errorResponse(res, `Route ${req.method} ${req.url} not found`, 404);
}

module.exports = { notFoundMiddleware };
