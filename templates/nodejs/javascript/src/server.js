const http = require("node:http");
const { app } = require("./app");
const { appConfig } = require("./config/app.config");
const { logger } = require("./common/utils/logger");

const server = http.createServer(app);

server.listen(appConfig.port, () => {
  logger.info(`[{{PROJECT_NAME}}] Node.js API running on http://localhost:${appConfig.port}`);
  logger.info(`[{{PROJECT_NAME}}] Health check: http://localhost:${appConfig.port}/health`);
});
