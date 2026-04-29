import { Router } from "express";
import healthRoutes from "./health.routes.js";
import { sendSuccess } from "../utils/response.js";

const router = Router();

router.get("/", (_req, res) => {
  return sendSuccess(res, "{{PROJECT_NAME}} API is running", {
    service: "{{PROJECT_NAME}}",
    health: "/health"
  });
});

router.use("/health", healthRoutes);

export default router;
