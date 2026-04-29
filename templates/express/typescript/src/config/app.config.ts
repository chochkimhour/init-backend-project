import dotenv from "dotenv";

dotenv.config({ quiet: true });

export const appConfig = {
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*"
};
