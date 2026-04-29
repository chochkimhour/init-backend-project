require("dotenv").config();

const appConfig = {
  env: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 3000),
  corsOrigin: process.env.CORS_ORIGIN || "*"
};

module.exports = { appConfig };
