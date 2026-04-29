const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");
const { appConfig } = require("./config/app.config");
const { errorMiddleware } = require("./middlewares/error.middleware");
const { notFoundMiddleware } = require("./middlewares/not-found.middleware");

const app = express();

app.use(cors({ origin: appConfig.corsOrigin }));
app.use(express.json());
app.use(morgan(appConfig.env === "production" ? "combined" : "dev"));

app.use(routes);

app.use(notFoundMiddleware);
app.use(errorMiddleware);

module.exports = { app };
