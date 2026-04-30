const { app } = require("./app");
const { appConfig } = require("./config/app.config");
const { logger } = require("./common/utils/logger");

app.listen(appConfig.port, () => {
  logger.info(`[{{PROJECT_NAME}}] API running on http://localhost:${appConfig.port}`);
});
