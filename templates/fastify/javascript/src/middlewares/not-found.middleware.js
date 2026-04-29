const { errorResponse } = require("../utils/response");

function registerNotFoundHandler(app) {
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send(errorResponse(`Route ${request.method} ${request.url} not found`));
  });
}

module.exports = { registerNotFoundHandler };
