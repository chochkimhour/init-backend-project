const { buildApp } = require("./app");
const { appConfig } = require("./config/app.config");

async function start() {
  const app = await buildApp();

  try {
    await app.listen({ port: appConfig.port, host: "0.0.0.0" });
    app.log.info(`[{{PROJECT_NAME}}] API running on http://localhost:${appConfig.port}`);
  } catch (error) {
    app.log.error(error);
    process.exit(1);
  }
}

start();
