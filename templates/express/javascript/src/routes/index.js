const { Router } = require("express");
const healthRoutes = require("./health.routes");
const { sendSuccess } = require("../utils/response");

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, "{{PROJECT_NAME}} API is running", {
    service: "{{PROJECT_NAME}}",
    health: "/health"
  });
});

router.use("/health", healthRoutes);

module.exports = router;
