import type { FastifyInstance } from "fastify";
import { errorResponse } from "../utils/response.js";

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    const statusCode = error.statusCode ?? 500;
    const message = statusCode === 500 ? "Internal server error" : error.message;

    return reply.status(statusCode).send(errorResponse(message));
  });
}
