#!/usr/bin/env node

import { Command } from "commander";
import chalk from "chalk";
import { generateProject } from "./generator.js";
import { promptForProjectOptions } from "./prompts.js";
import { logger } from "./utils/logger.js";

const program = new Command();
const CLI_NAME = "init-backend-project";
const CLI_VERSION = "1.1.5";
const CLI_HEADER = String.raw` _       _ _     _                _                  _                   _           _
(_)_ __ (_) |_  | |__   __ _  ___| | _____ _ __   __| |  _ __  _ __ ___ (_) ___  ___| |_
| | '_ \| | __| | '_ \ / _\` |/ __| |/ / _ \ '_ \ / _\` | | '_ \| '__/ _ \| |/ _ \/ __| __|
| | | | | | |_  | |_) | (_| | (__|   <  __/ | | | (_| | | |_) | | | (_) | |  __/ (__| |_
|_|_| |_|_|\__| |_.__/ \__,_|\___|_|\_\___|_| |_|\__,_| | .__/|_|  \___// |\___|\___|\__|
                                                        |_|          |__/`;

function colorizeHeader(header: string) {
  return chalk.hex("#f97316").bold(header);
}

program
  .name(CLI_NAME)
  .description("Create a professional backend starter project.")
  .argument("[project-name]", "Name of the project to create")
  .version(CLI_VERSION)
  .action(async (projectName?: string) => {
    try {
      logger.plain(colorizeHeader(CLI_HEADER));
      logger.plain("");
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
