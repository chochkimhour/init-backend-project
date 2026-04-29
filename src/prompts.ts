import path from "node:path";
import fs from "fs-extra";
import { confirm, input, select } from "@inquirer/prompts";
import type {
  ApiDocs,
  AuthType,
  Database,
  Framework,
  Language,
  Orm,
  PackageManager,
  ProjectOptions,
  Testing,
  Validation
} from "./types.js";
import { validateProjectName } from "./utils/validateProjectName.js";

export async function promptForProjectOptions(defaultName?: string): Promise<ProjectOptions> {
  const projectName = await input({
    message: "Project name:",
    default: defaultName,
    validate: validateProjectName
  });

  const targetDirectory = path.resolve(process.cwd(), projectName);
  const exists = await fs.pathExists(targetDirectory);
  const overwrite = exists
    ? await confirm({
        message: `Folder "${projectName}" already exists. Overwrite it?`,
        default: false
      })
    : false;

  const framework = await select<Framework>({
    message: "Backend framework:",
    choices: [
      { name: "Node.js", value: "nodejs" },
      { name: "Express", value: "express" },
      { name: "Fastify", value: "fastify" },
      { name: "NestJS", value: "nestjs" }
    ]
  });

  const language =
    framework === "nestjs"
      ? "typescript"
      : await select<Language>({
          message: "Language:",
          choices: [
            { name: "JavaScript", value: "javascript" },
            { name: "TypeScript", value: "typescript" }
          ]
        });

  const packageManager = await select<PackageManager>({
    message: "Package manager:",
    choices: [
      { name: "npm", value: "npm" },
      { name: "yarn", value: "yarn" },
      { name: "pnpm", value: "pnpm" }
    ]
  });

  const database = await select<Database>({
    message: "Database:",
    choices: [
      { name: "None", value: "none" },
      { name: "PostgreSQL", value: "postgresql" },
      { name: "MySQL", value: "mysql" },
      { name: "MongoDB (NoSQL)", value: "mongodb" },
      { name: "Redis", value: "redis" }
    ]
  });

  const orm = await select<Orm>({
    message: "ORM:",
    choices: [
      { name: "None", value: "none" },
      { name: "Prisma", value: "prisma" },
      { name: "TypeORM", value: "typeorm" },
      { name: "Mongoose", value: "mongoose", disabled: database !== "mongodb" ? "MongoDB only" : false }
    ]
  });

  const authType = await select<AuthType>({
    message: "Authentication:",
    choices: [
      { name: "None", value: "none" },
      { name: "JWT Auth", value: "jwt" },
      { name: "Session Auth", value: "session" }
    ]
  });

  const apiDocs = await select<ApiDocs>({
    message: "API documentation:",
    choices: [
      { name: "None", value: "none" },
      { name: "Swagger / OpenAPI", value: "swagger" }
    ]
  });

  const validation = await select<Validation>({
    message: "Validation:",
    choices: [
      { name: "None", value: "none" },
      { name: "Zod", value: "zod" },
      { name: "Joi", value: "joi" },
      {
        name: "class-validator for NestJS",
        value: "class-validator",
        disabled: framework !== "nestjs" ? "NestJS only" : false
      }
    ]
  });

  const includeDocker = await confirm({ message: "Include Docker?", default: true });
  const includeLinting = await confirm({ message: "Include ESLint and Prettier?", default: true });

  const testing = await select<Testing>({
    message: "Include testing setup?",
    choices: [
      { name: "None", value: "none" },
      { name: "Jest", value: "jest" },
      { name: "Vitest", value: "vitest" }
    ]
  });

  const initGit = await confirm({ message: "Initialize Git?", default: true });
  const installDependencies = await confirm({
    message: "Install dependencies after generation?",
    default: true
  });

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
