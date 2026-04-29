import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import type { ProjectOptions } from "./types.js";
import { applyTemplateReplacements, getTemplateDirectory } from "./templates.js";
import { logger } from "./utils/logger.js";
import { formatLabel } from "./utils/labels.js";
import { runCommand } from "./utils/runCommand.js";

const TEXT_EXTENSIONS = new Set([
  ".js",
  ".ts",
  ".json",
  ".md",
  ".env",
  ".example",
  ".gitignore",
  ".dockerignore",
  ".yml",
  ".yaml"
]);

const BASE_APP_FILES = [
  "package.json",
  "README.md",
  ".env.example",
  ".gitignore"
] as const;

type DependencySet = {
  dependencies: Set<string>;
  devDependencies: Set<string>;
};

export async function generateProject(options: ProjectOptions) {
  if (await fs.pathExists(options.targetDirectory)) {
    if (!options.overwrite) {
      throw new Error(`Folder "${options.projectName}" already exists.`);
    }

    await fs.emptyDir(options.targetDirectory);
  } else {
    await fs.ensureDir(options.targetDirectory);
  }

  const spinner = ora("Creating project files...").start();

  try {
    await copyTemplate(options);
    await writeBaseProjectFiles(options);

    if (options.includeDocker) {
      await writeDockerFiles(options);
    }

    if (options.includeLinting) {
      await writeLintingFiles(options);
    }

    if (options.testing !== "none") {
      await writeTestingFiles(options);
    }

    spinner.succeed("Project files created.");
  } catch (error) {
    spinner.fail("Failed to create project files.");
    throw error;
  }

  if (options.installDependencies) {
    const installSpinner = ora(`Installing dependencies with ${options.packageManager}...`).start();
    try {
      await installDependencies(options);
      installSpinner.succeed("Dependencies installed.");
    } catch (error) {
      installSpinner.fail("Dependency installation failed.");
      throw error;
    }
  }

  if (options.initGit) {
    const gitSpinner = ora("Initializing Git repository...").start();
    try {
      await runCommand("git", ["init"], options.targetDirectory);
      gitSpinner.succeed("Git repository initialized.");
    } catch {
      gitSpinner.text = "Could not initialize Git. You can run git init manually.";
      gitSpinner.warn();
    }
  }

  printSuccessMessage(options);
}

async function writeBaseProjectFiles(options: ProjectOptions) {
  const [packageJsonFile, readmeFile, envFile, gitignoreFile] = BASE_APP_FILES.map((file) =>
    path.join(options.targetDirectory, file)
  );

  await Promise.all([
    writeJson(packageJsonFile, createPackageJson(options)),
    fs.writeFile(readmeFile, createProjectReadme(options)),
    fs.writeFile(envFile, createEnvExample(options)),
    fs.writeFile(gitignoreFile, createGitignore())
  ]);
}

async function copyTemplate(options: ProjectOptions) {
  const templateDirectory = getTemplateDirectory(options.framework, options.language);

  if (!(await fs.pathExists(templateDirectory))) {
    throw new Error(`Template not found: ${templateDirectory}`);
  }

  await fs.copy(templateDirectory, options.targetDirectory);
  const files = await listFiles(options.targetDirectory);

  await Promise.all(
    files.map(async (file) => {
      if (!isTextTemplate(file)) {
        return;
      }

      const content = await fs.readFile(file, "utf8");
      await fs.writeFile(file, applyTemplateReplacements(content, options));
    })
  );
}

async function listFiles(directory: string): Promise<string[]> {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const fullPath = path.join(directory, entry.name);
      return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    })
  );

  return files.flat();
}

function isTextTemplate(file: string) {
  const basename = path.basename(file);
  return TEXT_EXTENSIONS.has(path.extname(file)) || basename.startsWith(".env") || basename.startsWith(".git");
}

function createPackageJson(options: ProjectOptions) {
  const { dependencies, devDependencies } = createDependencySets(options);
  const isTs = isTypeScriptProject(options);

  return {
    name: options.projectName,
    version: "1.0.0",
    description: `Backend API generated with init-backend-project.`,
    type: options.language === "javascript" && options.framework !== "nestjs" ? "commonjs" : "module",
    main: options.framework === "nestjs" ? "dist/main.js" : isTs ? "dist/server.js" : "src/server.js",
    scripts: createScripts(options),
    dependencies: toVersionMap(dependencies),
    devDependencies: toVersionMap(devDependencies),
    license: "MIT"
  };
}

function createDependencySets(options: ProjectOptions): DependencySet {
  const dependencySet: DependencySet = {
    dependencies: new Set<string>(),
    devDependencies: new Set<string>()
  };

  addFrameworkDependencies(options, dependencySet);
  addDatabaseDependencies(options, dependencySet);
  addFeatureDependencies(options, dependencySet);
  addToolingDependencies(options, dependencySet);

  return dependencySet;
}

function addFrameworkDependencies(options: ProjectOptions, dependencySet: DependencySet) {
  const { dependencies, devDependencies } = dependencySet;
  const isTs = isTypeScriptProject(options);

  if (options.framework === "express") {
    addDependencies(dependencies, ["express", "cors", "dotenv", "morgan"]);
    isTs ? addDependencies(devDependencies, ["@types/express", "@types/cors", "@types/morgan"]) : devDependencies.add("nodemon");
  }

  if (options.framework === "nodejs") {
    dependencies.add("dotenv");
    if (!isTs) {
      devDependencies.add("nodemon");
    }
  }

  if (options.framework === "fastify") {
    addDependencies(dependencies, ["fastify", "@fastify/cors", "dotenv"]);
    if (!isTs) {
      devDependencies.add("nodemon");
    }
  }

  if (options.framework === "nestjs") {
    addDependencies(dependencies, [
      "@nestjs/common",
      "@nestjs/core",
      "@nestjs/platform-express",
      "@nestjs/config",
      "reflect-metadata",
      "rxjs"
    ]);
    addDependencies(devDependencies, ["@nestjs/cli", "@nestjs/schematics"]);
  }
}

function addDatabaseDependencies(options: ProjectOptions, dependencySet: DependencySet) {
  const { dependencies, devDependencies } = dependencySet;

  if (options.database === "postgresql") {
    dependencies.add("pg");
  }

  if (options.database === "mysql") {
    dependencies.add("mysql2");
  }

  if (options.database === "mongodb") {
    dependencies.add(options.orm === "mongoose" ? "mongoose" : "mongodb");
  }

  if (options.database === "redis") {
    dependencies.add("redis");
  }

  if (options.orm === "prisma") {
    dependencies.add("@prisma/client");
    devDependencies.add("prisma");
  }

  if (options.orm === "typeorm") {
    dependencies.add("typeorm");
    dependencies.add("reflect-metadata");
  }
}

function addFeatureDependencies(options: ProjectOptions, dependencySet: DependencySet) {
  const { dependencies, devDependencies } = dependencySet;

  if (options.authType === "jwt") {
    dependencies.add("jsonwebtoken");
    dependencies.add("bcryptjs");
    if (isTypeScriptProject(options)) {
      devDependencies.add("@types/jsonwebtoken");
      devDependencies.add("@types/bcryptjs");
    }
  }

  if (options.apiDocs === "swagger") {
    if (options.framework === "nestjs") {
      dependencies.add("@nestjs/swagger");
      dependencies.add("swagger-ui-express");
    } else {
      dependencies.add("swagger-jsdoc");
      dependencies.add("swagger-ui-express");
      if (options.language === "typescript") {
        devDependencies.add("@types/swagger-jsdoc");
        devDependencies.add("@types/swagger-ui-express");
      }
    }
  }

  if (options.validation === "zod") {
    dependencies.add("zod");
  }

  if (options.validation === "joi") {
    dependencies.add("joi");
  }

  if (options.validation === "class-validator") {
    dependencies.add("class-validator");
    dependencies.add("class-transformer");
  }
}

function addToolingDependencies(options: ProjectOptions, dependencySet: DependencySet) {
  const { devDependencies } = dependencySet;
  const isTs = isTypeScriptProject(options);

  if (isTs) {
    addDependencies(devDependencies, ["typescript", "tsx", "@types/node"]);
  }

  if (options.includeLinting) {
    addDependencies(devDependencies, ["eslint", "prettier", "@eslint/js", "typescript-eslint"]);
  }

  if (options.testing === "jest") {
    devDependencies.add("jest");
    if (isTs) {
      addDependencies(devDependencies, ["ts-jest", "@types/jest"]);
    }
  }

  if (options.testing === "vitest") {
    devDependencies.add("vitest");
  }
}

function createScripts(options: ProjectOptions) {
  const scripts: Record<string, string> = {};

  if (options.framework === "nestjs") {
    scripts.start = "nest start";
    scripts["start:dev"] = "nest start --watch";
    scripts.build = "nest build";
  } else if (isTypeScriptProject(options)) {
    scripts.dev = "tsx watch src/server.ts";
    scripts.build = "tsc";
    scripts.start = "node dist/server.js";
  } else {
    scripts.dev = "nodemon src/server.js";
    scripts.start = "node src/server.js";
  }

  if (options.includeLinting) {
    scripts.lint = "eslint .";
    scripts.format = "prettier --write .";
  }

  if (options.testing === "jest") {
    scripts.test = "jest";
  }

  if (options.testing === "vitest") {
    scripts.test = "vitest";
  }

  return scripts;
}

function addDependencies(target: Set<string>, dependencies: string[]) {
  dependencies.forEach((dependency) => target.add(dependency));
}

function isTypeScriptProject(options: ProjectOptions) {
  return options.language === "typescript" || options.framework === "nestjs";
}

function toVersionMap(dependencies: Set<string>) {
  return Object.fromEntries([...dependencies].sort().map((dependency) => [dependency, "latest"]));
}

async function writeJson(file: string, value: unknown) {
  await fs.writeJson(file, value, { spaces: 2 });
}

function createEnvExample(options: ProjectOptions) {
  const lines = ["NODE_ENV=development", "PORT=3000", "CORS_ORIGIN=*"];

  if (options.database !== "none") {
    lines.push("DATABASE_URL=");
  }

  if (options.authType === "jwt") {
    lines.push("JWT_SECRET=change-me", "JWT_EXPIRES_IN=1d");
  }

  if (options.authType === "session") {
    lines.push("SESSION_SECRET=change-me");
  }

  return `${lines.join("\n")}\n`;
}

function createGitignore() {
  return `node_modules
dist
coverage
.env
.DS_Store
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
`;
}

async function writeDockerFiles(options: ProjectOptions) {
  const isTs = isTypeScriptProject(options);
  const runtime = getPackageManagerRuntime(options.packageManager);
  const startCommand =
    options.framework === "nestjs"
      ? `${runtime.run} start`
      : isTs
        ? `${runtime.run} build && ${runtime.run} start`
        : `${runtime.run} start`;

  await fs.writeFile(
    path.join(options.targetDirectory, "Dockerfile"),
    `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
${runtime.prepareCommand ? `${runtime.prepareCommand}\n` : ""}RUN ${runtime.installCommand}

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "${startCommand}"]
`
  );

  await fs.writeFile(
    path.join(options.targetDirectory, ".dockerignore"),
    `node_modules
dist
coverage
.env
.git
`
  );
}

function getPackageManagerRuntime(packageManager: ProjectOptions["packageManager"]) {
  if (packageManager === "yarn") {
    return {
      prepareCommand: "RUN corepack enable",
      installCommand: "yarn install",
      run: "yarn"
    };
  }

  if (packageManager === "pnpm") {
    return {
      prepareCommand: "RUN corepack enable",
      installCommand: "pnpm install",
      run: "pnpm"
    };
  }

  return {
    prepareCommand: "",
    installCommand: "npm install",
    run: "npm run"
  };
}

async function writeLintingFiles(options: ProjectOptions) {
  const isTs = isTypeScriptProject(options);
  const config = isTs
    ? `import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "coverage", "node_modules"]
  }
);
`
    : `import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: ["dist", "coverage", "node_modules"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs"
    }
  }
];
`;

  const eslintFileName = isTs ? "eslint.config.js" : "eslint.config.mjs";
  await fs.writeFile(path.join(options.targetDirectory, eslintFileName), config);
  await fs.writeFile(path.join(options.targetDirectory, ".prettierrc"), `${JSON.stringify({ semi: true, singleQuote: false }, null, 2)}\n`);
}

async function writeTestingFiles(options: ProjectOptions) {
  if (options.testing === "jest") {
    const isTs = isTypeScriptProject(options);
    const fileName = isTs ? "jest.config.js" : "jest.config.cjs";
    const config = isTs
      ? `export default {
  testEnvironment: "node",
  transform: {"^.+\\\\.ts$": ["ts-jest", { "useESM": true }]},
  testMatch: ["**/*.test.ts"]
};
`
      : `module.exports = {
  testEnvironment: "node",
  testMatch: ["**/*.test.js"]
};
`;

    await fs.writeFile(
      path.join(options.targetDirectory, fileName),
      config
    );
  }

  if (options.testing === "vitest") {
    await fs.writeFile(
      path.join(options.targetDirectory, "vitest.config.ts"),
      `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node"
  }
});
`
    );
  }
}

async function installDependencies(options: ProjectOptions) {
  const commands = {
    npm: ["npm", ["install"]],
    yarn: ["yarn", ["install"]],
    pnpm: ["pnpm", ["install"]]
  } as const;

  const [command, args] = commands[options.packageManager];
  await runCommand(command, [...args], options.targetDirectory);
}

function createProjectReadme(options: ProjectOptions) {
  const devCommand = options.framework === "nestjs" ? `${options.packageManager} run start:dev` : `${options.packageManager} run dev`;
  const buildCommand = `${options.packageManager} run build`;
  const installCommand = getInstallCommand(options.packageManager);
  const scripts = getGeneratedScriptDescriptions(options);

  return `# ${options.projectName}

Backend API generated with init-backend-project.

## Stack

- Framework: ${formatLabel(options.framework)}
- Language: ${formatLabel(options.framework === "nestjs" ? "typescript" : options.language)}
- Database: ${formatLabel(options.database)}
- ORM: ${formatLabel(options.orm)}
- Authentication: ${formatLabel(options.authType)}
- API documentation: ${formatLabel(options.apiDocs)}
- Validation: ${formatLabel(options.validation)}
- Testing: ${formatLabel(options.testing)}

## Installation

\`\`\`bash
${installCommand}
\`\`\`

## Environment Variables

Copy \`.env.example\` to \`.env\` and update values for your environment.

## Development

\`\`\`bash
${devCommand}
\`\`\`

The API runs at \`http://localhost:3000\`.

## Build

${isTypeScriptProject(options) ? `\`\`\`bash
${buildCommand}
\`\`\`` : "This JavaScript project does not require a build step."}

## API Endpoints

- \`GET /health\` - Returns API health status.

## Folder Structure

\`\`\`text
src/
  config/
  controllers or modules/
  middlewares or common/
  services/
  app/main entrypoint
\`\`\`

## Scripts

${scripts.map((script) => `- \`${script.name}\` - ${script.description}`).join("\n")}

## License

MIT
`;
}

function getGeneratedScriptDescriptions(options: ProjectOptions) {
  const scripts = [
    {
      name: options.framework === "nestjs" ? "start:dev" : "dev",
      description: "Run the development server"
    },
    {
      name: "start",
      description: "Run the production server"
    }
  ];

  if (isTypeScriptProject(options)) {
    scripts.push({
      name: "build",
      description: "Compile TypeScript"
    });
  }

  if (options.includeLinting) {
    scripts.push(
      {
        name: "lint",
        description: "Run ESLint"
      },
      {
        name: "format",
        description: "Format files with Prettier"
      }
    );
  }

  if (options.testing !== "none") {
    scripts.push({
      name: "test",
      description: "Run tests"
    });
  }

  return scripts;
}

function getInstallCommand(packageManager: string) {
  if (packageManager === "yarn") {
    return "yarn install";
  }

  if (packageManager === "pnpm") {
    return "pnpm install";
  }

  return "npm install";
}

function printSuccessMessage(options: ProjectOptions) {
  const devScript = options.framework === "nestjs" ? "start:dev" : "dev";

  logger.plain("");
  logger.success("Success! Your backend project has been created.");
  logger.plain("");
  logger.plain("Next steps:");
  logger.plain("");
  logger.plain(`cd ${options.projectName}`);
  if (!options.installDependencies) {
    logger.plain(getInstallCommand(options.packageManager));
  }
  logger.plain(`${options.packageManager} run ${devScript}`);
  logger.plain("");
  logger.plain("API will run at:");
  logger.plain("");
  logger.plain("http://localhost:3000");
  logger.plain("");
  logger.plain("Health check:");
  logger.plain("");
  logger.plain("http://localhost:3000/health");
}
