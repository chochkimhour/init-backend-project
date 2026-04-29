const healthRoutes = require("./health.routes");

async function registerRoutes(app) {
  app.get("/", async () => ({
    success: true,
    message: "{{PROJECT_NAME}} API is running",
    service: "{{PROJECT_NAME}}",
    health: "/health"
  }));

  await app.register(healthRoutes, { prefix: "/health" });
}

module.exports = registerRoutes;
