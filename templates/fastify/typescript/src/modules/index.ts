import type { FastifyInstance } from "fastify";
import healthRoutes from "./health/health.routes.js";

export async function registerRoutes(app: FastifyInstance) {
  app.get("/", async () => ({
    success: true,
    message: "{{PROJECT_NAME}} Fastify API is running",
    service: "{{PROJECT_NAME}}",
    framework: "Fastify",
    health: "/health"
  }));

  await app.register(healthRoutes, { prefix: "/health" });
}
