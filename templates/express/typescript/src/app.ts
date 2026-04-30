import express from "express";
import cors from "cors";
import morgan from "morgan";
import routes from "./modules/index.js";
import { appConfig } from "./config/app.config.js";
import { errorMiddleware } from "./common/middlewares/error.middleware.js";
import { notFoundMiddleware } from "./common/middlewares/not-found.middleware.js";

export const app = express();

app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json());
app.use(morgan(appConfig.env === "production" ? "combined" : "dev"));

app.use(routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);
