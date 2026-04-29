import { app } from "./app.js";
import { appConfig } from "./config/app.config.js";
import { logger } from "./utils/logger.js";

app.listen(appConfig.port, () => {
  logger.info(`[{{PROJECT_NAME}}] API running on http://localhost:${appConfig.port}`);
});
