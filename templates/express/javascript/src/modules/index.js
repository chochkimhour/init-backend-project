const { Router } = require("express");
const { sendSuccess } = require("../common/http/response");
const healthRoutes = require("./health/health.routes");

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, "{{PROJECT_NAME}} Express API is running", {
    service: "{{PROJECT_NAME}}",
    framework: "Express",
    health: "/health"
  });
});

router.use("/health", healthRoutes);

module.exports = router;
