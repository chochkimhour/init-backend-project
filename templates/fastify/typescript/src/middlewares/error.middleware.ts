import type { FastifyInstance } from "fastify";
import { errorResponse } from "../utils/response.js";

type HttpError = Error & {
  statusCode?: number;
};

export function registerErrorHandler(app: FastifyInstance) {
  app.setErrorHandler((error, _request, reply) => {
    app.log.error(error);

    const httpError = error as HttpError;
    const statusCode = httpError.statusCode ?? 500;
    const message = statusCode === 500 ? "Internal server error" : httpError.message;

    return reply.status(statusCode).send(errorResponse(message));
  });
}
