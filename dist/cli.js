#!/usr/bin/env node
import { Command } from "commander";
import chalk from "chalk";
import { generateProject } from "./generator.js";
import { promptForProjectOptions } from "./prompts.js";
import { logger } from "./utils/logger.js";
const program = new Command();
program
    .name("init-backend-project")
    .description("Create a professional backend starter project.")
    .argument("[project-name]", "Name of the project to create")
    .version("1.0.0")
    .action(async (projectName) => {
    try {
        logger.plain(chalk.bold("\ninit-backend-project\n"));
        const options = await promptForProjectOptions(projectName);
        if (!options.overwrite && options.targetDirectory && projectName) {
            // Existence is checked in prompts. This keeps Commander argument flow simple.
        }
        await generateProject(options);
    }
    catch (error) {
        if (error instanceof Error && error.name === "ExitPromptError") {
            logger.warn("\nGeneration cancelled.");
            process.exit(0);
        }
        logger.error(error instanceof Error ? error.message : "Something went wrong.");
        process.exit(1);
    }
});
program.parseAsync(process.argv);
//# sourceMappingURL=cli.js.map