const http = require("node:http");
const { app } = require("./app");
const { appConfig } = require("./config/app.config");
const { logger } = require("./utils/logger");

const server = http.createServer(app);

server.listen(appConfig.port, () => {
  logger.info(`{{PROJECT_NAME}} API running on http://localhost:${appConfig.port}`);
});
