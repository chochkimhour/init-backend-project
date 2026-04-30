import path from "node:path";
import fs from "fs-extra";
import { input, select } from "@inquirer/prompts";
import { validateProjectName } from "./utils/validateProjectName.js";
function numberedChoices(choices) {
    return choices.map((choice, index) => ({
        ...choice,
        name: `${index + 1}. ${choice.name}`,
        short: choice.short ?? choice.name
    }));
}
async function confirmYesNo(message, defaultValue = false) {
    return select({
        message: `${message} (Yes/No)`,
        choices: [
            { name: "Yes", value: true, short: "Yes" },
            { name: "No", value: false, short: "No" }
        ],
        default: defaultValue
    });
}
export async function promptForProjectOptions(defaultName) {
    const projectName = await input({
        message: "Project name:",
        default: defaultName,
        validate: validateProjectName
    });
    const targetDirectory = path.resolve(process.cwd(), projectName);
    const exists = await fs.pathExists(targetDirectory);
    const overwrite = exists
        ? await confirmYesNo(`Folder "${projectName}" already exists. Overwrite it?`, false)
        : false;
    const framework = await select({
        message: "Backend framework:",
        choices: numberedChoices([
            { name: "Node.js", value: "nodejs" },
            { name: "Express", value: "express" },
            { name: "Fastify", value: "fastify" },
            { name: "NestJS", value: "nestjs" }
        ])
    });
    const language = framework === "nestjs"
        ? "typescript"
        : await select({
            message: "Language:",
            choices: numberedChoices([
                { name: "JavaScript", value: "javascript" },
                { name: "TypeScript", value: "typescript" }
            ])
        });
    const packageManager = await select({
        message: "Package manager:",
        choices: numberedChoices([
            { name: "npm", value: "npm" },
            { name: "yarn", value: "yarn" },
            { name: "pnpm", value: "pnpm" }
        ])
    });
    const database = await select({
        message: "Database:",
        choices: numberedChoices([
            { name: "None", value: "none" },
            { name: "PostgreSQL", value: "postgresql" },
            { name: "MySQL", value: "mysql" },
            { name: "MongoDB", value: "mongodb" },
            { name: "Redis", value: "redis" }
        ])
    });
    const orm = await select({
        message: "ORM:",
        choices: numberedChoices([
            { name: "None", value: "none" },
            {
                name: "Prisma",
                value: "prisma",
                disabled: database === "none" || database === "redis" ? "requires PostgreSQL, MySQL, or MongoDB" : false
            },
            {
                name: "TypeORM",
                value: "typeorm",
                disabled: database === "none" || database === "redis" ? "requires PostgreSQL, MySQL, or MongoDB" : false
            },
            {
                name: "Mongoose",
                value: "mongoose",
                disabled: database !== "mongodb" ? "available for MongoDB only" : false
            }
        ])
    });
    const authType = await select({
        message: "Authentication:",
        choices: numberedChoices([
            { name: "None", value: "none" },
            { name: "JWT Auth", value: "jwt" },
            { name: "Session Auth", value: "session" }
        ])
    });
    const apiDocs = await select({
        message: "API documentation:",
        choices: numberedChoices([
            { name: "None", value: "none" },
            { name: "Swagger / OpenAPI", value: "swagger" }
        ])
    });
    const validation = await select({
        message: "Validation:",
        choices: numberedChoices([
            { name: "None", value: "none" },
            { name: "Zod", value: "zod" },
            { name: "Joi", value: "joi" },
            {
                name: "class-validator for NestJS",
                value: "class-validator",
                disabled: framework !== "nestjs" ? "available for NestJS only" : false
            }
        ])
    });
    const includeDocker = await confirmYesNo("Include Docker and Docker Compose?", false);
    const includeLinting = await confirmYesNo("Include ESLint and Prettier?", true);
    const testing = await select({
        message: "Include testing setup?",
        choices: numberedChoices([
            { name: "None", value: "none" },
            { name: "Jest", value: "jest" },
            { name: "Vitest", value: "vitest" }
        ])
    });
    const initGit = await confirmYesNo("Initialize Git repository?", false);
    const installDependencies = await confirmYesNo("Install dependencies after generation?", true);
    return {
        projectName,
        targetDirectory,
        language,
        framework,
        packageManager,
        database,
        orm,
        authType,
        apiDocs,
        validation,
        includeDocker,
        includeLinting,
        testing,
        initGit,
        installDependencies,
        overwrite
    };
}
//# sourceMappingURL=prompts.js.map