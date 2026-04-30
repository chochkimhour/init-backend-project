import type { FastifyReply, FastifyRequest } from "fastify";
import { successResponse } from "../../common/http/response.js";
import { getHealthStatus } from "./health.service.js";

export async function healthController(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse("API is running", getHealthStatus()));
}
