import { app } from "./app.js";
import { appConfig } from "./config/app.config.js";
import { logger } from "./common/utils/logger.js";

app.listen(appConfig.port, () => {
  logger.info(`[{{PROJECT_NAME}}] Express API running on http://localhost:${appConfig.port}`);
  logger.info(`[{{PROJECT_NAME}}] Health check: http://localhost:${appConfig.port}/health`);
});
