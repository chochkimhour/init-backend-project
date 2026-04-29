import type { FastifyInstance } from "fastify";
import { errorResponse } from "../utils/response.js";

export function registerNotFoundHandler(app: FastifyInstance) {
  app.setNotFoundHandler((request, reply) => {
    return reply.status(404).send(errorResponse(`Route ${request.method} ${request.url} not found`));
  });
}
