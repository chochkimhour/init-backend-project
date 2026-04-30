const healthRoutes = require("./health/health.routes");

async function registerRoutes(app) {
  app.get("/", async () => ({
    success: true,
    message: "{{PROJECT_NAME}} Fastify API is running",
    service: "{{PROJECT_NAME}}",
    framework: "Fastify",
    health: "/health"
  }));

  await app.register(healthRoutes, { prefix: "/health" });
}

module.exports = { registerRoutes };
