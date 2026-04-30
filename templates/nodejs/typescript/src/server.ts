import http from "node:http";
import { app } from "./app.js";
import { appConfig } from "./config/app.config.js";
import { logger } from "./common/utils/logger.js";

const server = http.createServer(app);

server.listen(appConfig.port, () => {
  logger.info(`[{{PROJECT_NAME}}] Node.js API running on http://localhost:${appConfig.port}`);
});
