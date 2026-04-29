import type { FastifyReply, FastifyRequest } from "fastify";
import { getHealthStatus } from "../services/health.service.js";
import { successResponse } from "../utils/response.js";

export async function healthController(_request: FastifyRequest, reply: FastifyReply) {
  return reply.send(successResponse("API is running", getHealthStatus()));
}
