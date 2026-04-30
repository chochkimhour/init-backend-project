import { Router } from "express";
import { sendSuccess } from "../common/http/response.js";
import healthRoutes from "./health/health.routes.js";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, "{{PROJECT_NAME}} API is running", {
    service: "{{PROJECT_NAME}}",
    health: "/health"
  });
});

router.use("/health", healthRoutes);

export default router;
