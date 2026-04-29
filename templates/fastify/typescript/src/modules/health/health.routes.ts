import type { FastifyInstance } from "fastify";
import { healthController } from "./health.controller.js";

export default async function healthRoutes(app: FastifyInstance) {
  app.get("/", healthController);
}
