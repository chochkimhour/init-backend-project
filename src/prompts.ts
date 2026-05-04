import path from "node:path";
import fs from "fs-extra";
import { input, select } from "@inquirer/prompts";
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

type SelectChoice<T extends string> = {
  name: string;
  value: T;
  disabled?: boolean | string;
  short?: string;
};

function numberedChoices<T extends string>(choices: SelectChoice<T>[]): SelectChoice<T>[] {
  return choices.map((choice, index) => ({
    ...choice,
    name: `${index + 1}. ${choice.name}`,
    short: choice.short ?? choice.name
  }));
}

async function confirmYesNo(message: string, defaultValue = false): Promise<boolean> {
  return select<boolean>({
    message,
    choices: [
      { name: "Yes", value: true, short: "Yes" },
      { name: "No", value: false, short: "No" }
    ],
    default: defaultValue
  });
}

async function selectFeatureLabel(message: string, enabledLabel: string, defaultValue = false): Promise<boolean> {
  return select<boolean>({
    message,
    choices: [
      { name: enabledLabel, value: true, short: enabledLabel },
      { name: "None", value: false, short: "None" }
    ],
    default: defaultValue
  });
}

export async function promptForProjectOptions(defaultName?: string): Promise<ProjectOptions> {
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

  const framework = await select<Framework>({
    message: "Backend framework:",
    choices: numberedChoices([
      { name: "Node.js", value: "nodejs" },
      { name: "Express", value: "express" },
      { name: "Fastify", value: "fastify" },
      { name: "NestJS", value: "nestjs" }
    ])
  });

  const language =
    framework === "nestjs"
      ? "typescript"
      : await select<Language>({
        message: "Language:",
        choices: numberedChoices([
          { name: "JavaScript", value: "javascript" },
          { name: "TypeScript", value: "typescript" }
        ])
      });

  const packageManager = await select<PackageManager>({
    message: "Package manager:",
    choices: numberedChoices([
      { name: "npm", value: "npm" },
      { name: "yarn", value: "yarn" },
      { name: "pnpm", value: "pnpm" }
    ])
  });

  const database = await select<Database>({
    message: "Database:",
    choices: numberedChoices([
      { name: "None", value: "none" },
      { name: "PostgreSQL", value: "postgresql" },
      { name: "MySQL", value: "mysql" },
      { name: "MongoDB", value: "mongodb" },
      { name: "Redis", value: "redis" }
    ])
  });

  const orm = await select<Orm>({
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

  const authType = await select<AuthType>({
    message: "Authentication:",
    choices: numberedChoices([
      { name: "None", value: "none" },
      { name: "JWT", value: "jwt" },
      { name: "Session", value: "session" }
    ])
  });

  const apiDocs = await select<ApiDocs>({
    message: "API documentation:",
    choices: numberedChoices([
      { name: "None", value: "none" },
      { name: "Swagger / OpenAPI", value: "swagger" }
    ])
  });

  const validation = await select<Validation>({
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

  const includeDocker = await confirmYesNo("Docker support?", false);
  const includeLinting = await selectFeatureLabel("Code quality tools:", "ESLint + Prettier", true);

  const testing = await select<Testing>({
    message: "Testing framework:",
    choices: numberedChoices([
      { name: "None", value: "none" },
      { name: "Jest", value: "jest" },
      { name: "Vitest", value: "vitest" }
    ])
  });

  const initGit = await confirmYesNo("Git repository?", false);
  const installDependencies = await confirmYesNo("Install dependencies?", true);

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
