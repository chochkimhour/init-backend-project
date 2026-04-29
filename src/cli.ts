#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { generateProject } from "./generator.js";
import { promptForProjectOptions } from "./prompts.js";
import { logger } from "./utils/logger.js";

const program = new Command();
const CLI_NAME = "init-backend-project";
const CLI_VERSION = "1.0.0";

program
  .name(CLI_NAME)
  .description("Create a professional backend starter project.")
  .argument("[project-name]", "Name of the project to create")
  .version(CLI_VERSION)
  .action(async (projectName?: string) => {
    try {
      logger.plain(chalk.bold(`\n${CLI_NAME}\n`));
      const options = await promptForProjectOptions(projectName);
      await generateProject(options);
    } catch (error) {
      if (error instanceof Error && error.name === "ExitPromptError") {
        logger.warn("\nGeneration cancelled.");
        process.exitCode = 0;
        return;
      }

      logger.error(error instanceof Error ? error.message : "Something went wrong.");
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
