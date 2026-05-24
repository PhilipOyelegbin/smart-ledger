import { createApp } from "./app";
import { AppDataSource } from "./config/data-source";
import { env } from "./config/env";
import { logger } from "./config/logger";

const start = async () => {
  try {
    await AppDataSource.initialize();
    const app = createApp();

    app.listen(env.port, () => {
      logger.info(`SmartLedger API listening on port ${env.port}`);
    });
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

void start();
