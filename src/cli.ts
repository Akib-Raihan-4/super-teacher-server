import { Logger } from "@nestjs/common";

import { CommandFactory } from "nest-commander";

import { AppModule } from "./app.module";

async function bootstrap() {
  try {
    await CommandFactory.run(AppModule, {
      logger: ["warn", "error"],
    });
  } catch (error) {
    Logger.error("Command execution failed", error);
    process.exit(1);
  }
}

bootstrap();
