import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import hpp from "hpp";
import xssClean from "xss-clean";
import mongoSanitize from "express-mongo-sanitize";
import cookieParser from "cookie-parser";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { httpLogger } from "./middlewares/logging.middleware";
import { requestIdMiddleware } from "./middlewares/request-id.middleware";
import {
  errorMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware";
import router from "./routes";
import { swaggerSpec, swaggerUiOptions } from "./config/swagger";

export const createApp = () => {
  const app = express();

  app.use(requestIdMiddleware);
  app.use(httpLogger);
  app.use(helmet());
  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(
    rateLimit({ windowMs: env.rateLimitWindowMs, max: env.rateLimitMax }),
  );
  app.use(express.json({ limit: "2mb" }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.use(hpp());
  app.use(xssClean());
  app.use(mongoSanitize());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "SmartLedger API",
      result: { version: "v1" },
    });
  });

  app.use("/api/v1", router);
  app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec, swaggerUiOptions),
  );
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
};
