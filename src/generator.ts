import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import chalk from "chalk";
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

const DEPENDENCY_VERSIONS: Record<string, string> = {
  "@eslint/js": "9.39.1",
  "@fastify/cors": "11.1.0",
  "@nestjs/common": "11.1.8",
  "@nestjs/config": "4.0.2",
  "@nestjs/core": "11.1.8",
  "@nestjs/platform-express": "11.1.8",
  "@nestjs/swagger": "11.2.1",
  "@prisma/client": "6.19.0",
  "@types/bcryptjs": "2.4.6",
  "@types/cors": "2.8.19",
  "@types/express": "5.0.5",
  "@types/jest": "30.0.0",
  "@types/jsonwebtoken": "9.0.10",
  "@types/morgan": "1.9.10",
  "@types/node": "22.19.1",
  "@types/swagger-jsdoc": "6.0.4",
  "@types/swagger-ui-express": "4.1.8",
  "bcryptjs": "3.0.3",
  "class-transformer": "0.5.1",
  "class-validator": "0.14.2",
  "cors": "2.8.5",
  "dotenv": "16.6.1",
  "eslint": "9.39.1",
  "express": "5.1.0",
  "fastify": "5.6.2",
  "jest": "30.2.0",
  "joi": "18.0.2",
  "jsonwebtoken": "9.0.2",
  "mongodb": "6.21.0",
  "mongoose": "8.20.0",
  "morgan": "1.10.1",
  "mysql2": "3.15.3",
  "nodemon": "3.1.11",
  "pg": "8.16.3",
  "prettier": "3.6.2",
  "prisma": "6.19.0",
  "redis": "5.10.0",
  "reflect-metadata": "0.2.2",
  "rxjs": "7.8.2",
  "swagger-jsdoc": "6.2.8",
  "swagger-ui-express": "5.0.1",
  "ts-jest": "29.4.5",
  "tsx": "4.20.6",
  "typeorm": "0.3.27",
  "typescript": "5.9.3",
  "typescript-eslint": "8.48.0",
  "vitest": "3.2.4",
  "zod": "3.25.76"
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
  } catch (error) {
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
    if (isTs) {
      addDependencies(devDependencies, ["@types/express", "@types/cors", "@types/morgan"]);
    }
  }

  if (options.framework === "nodejs") {
    dependencies.add("dotenv");
  }

  if (options.framework === "fastify") {
    addDependencies(dependencies, ["fastify", "@fastify/cors", "dotenv"]);
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
    devDependencies.add("@types/express");
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
  } else {
    devDependencies.add("nodemon");
  }

  if (options.includeLinting) {
    addDependencies(devDependencies, ["eslint", "prettier", "@eslint/js"]);

    if (isTs) {
      devDependencies.add("typescript-eslint");
    }
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
    scripts.dev = "tsx watch src/main.ts";
    scripts["start:dev"] = "tsx watch src/main.ts";
    scripts.build = "tsc";
    scripts.start = "node dist/main.js";
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
  return Object.fromEntries(
    [...dependencies].sort().map((dependency) => [dependency, DEPENDENCY_VERSIONS[dependency] ?? "latest"])
  );
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
.env.*
!.env.example
.cache/
.turbo/
.vite/
.next/
.eslintcache
*.tsbuildinfo
logs/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*
.pnpm-store/
.npm/
.yarn/cache/
.yarn/unplugged/
.yarn/build-state.yml
.yarn/install-state.gz
.DS_Store
Thumbs.db
.idea/
.vscode/
*.swp
*.swo
`;
}

async function writeDockerFiles(options: ProjectOptions) {
  const isTs = isTypeScriptProject(options);
  const runtime = getPackageManagerRuntime(options.packageManager);
  const buildCommand = isTs ? `RUN ${runtime.run} build` : "";
  const appArtifact = isTs ? "dist" : "src";
  const copyPackageFilesCommand = getPackageFileCopyCommand(options.packageManager);

  await Promise.all([
    fs.writeFile(
      path.join(options.targetDirectory, "Dockerfile"),
      `FROM node:22-alpine AS build

WORKDIR /app

${copyPackageFilesCommand}
${runtime.prepareCommand ? `${runtime.prepareCommand}\n` : ""}RUN ${runtime.installCommand}

COPY . .
${buildCommand}

FROM node:22-alpine AS production

ENV NODE_ENV=production
WORKDIR /app

${copyPackageFilesCommand}
${runtime.prepareCommand ? `${runtime.prepareCommand}\n` : ""}RUN ${runtime.productionInstallCommand}
COPY --from=build /app/${appArtifact} ./${appArtifact}

USER node
EXPOSE 3000
CMD ["sh", "-c", "${runtime.run} start"]
`
    ),

    fs.writeFile(
      path.join(options.targetDirectory, ".dockerignore"),
      `node_modules
dist
coverage
.env
.git
`
    ),

    fs.writeFile(path.join(options.targetDirectory, "docker-compose.yml"), createDockerCompose(options))
  ]);
}

function createDockerCompose(options: ProjectOptions) {
  const databaseService = createComposeDatabaseService(options);
  const databaseUrl = getComposeDatabaseUrl(options);
  const apiEnvironment = [
    "NODE_ENV=production",
    "PORT=3000",
    "CORS_ORIGIN=*",
    ...(databaseUrl ? [`DATABASE_URL=${databaseUrl}`] : [])
  ];
  const dependsOn = databaseService ? `    depends_on:
      - ${databaseService.name}
` : "";

  return `services:
  api:
    build: .
    restart: unless-stopped
    ports:
      - "3000:3000"
    environment:
${apiEnvironment.map((line) => `      - ${line}`).join("\n")}
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://localhost:3000/health"]
      interval: 30s
      timeout: 5s
      retries: 3
${dependsOn}${databaseService ? `\n${databaseService.definition}` : ""}`;
}

function createComposeDatabaseService(options: ProjectOptions) {
  if (options.database === "postgresql") {
    return {
      name: "postgres",
      definition: `  postgres:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_DB: app
      POSTGRES_USER: app
      POSTGRES_PASSWORD: app
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

volumes:
  postgres_data:
`
    };
  }

  if (options.database === "mysql") {
    return {
      name: "mysql",
      definition: `  mysql:
    image: mysql:8.4
    restart: unless-stopped
    environment:
      MYSQL_DATABASE: app
      MYSQL_USER: app
      MYSQL_PASSWORD: app
      MYSQL_ROOT_PASSWORD: root
    ports:
      - "3306:3306"
    volumes:
      - mysql_data:/var/lib/mysql

volumes:
  mysql_data:
`
    };
  }

  if (options.database === "mongodb") {
    return {
      name: "mongodb",
      definition: `  mongodb:
    image: mongo:7
    restart: unless-stopped
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
`
    };
  }

  if (options.database === "redis") {
    return {
      name: "redis",
      definition: `  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data

volumes:
  redis_data:
`
    };
  }

  return null;
}

function getComposeDatabaseUrl(options: ProjectOptions) {
  if (options.database === "postgresql") {
    return "postgresql://app:app@postgres:5432/app";
  }

  if (options.database === "mysql") {
    return "mysql://app:app@mysql:3306/app";
  }

  if (options.database === "mongodb") {
    return "mongodb://mongodb:27017/app";
  }

  if (options.database === "redis") {
    return "redis://redis:6379";
  }

  return "";
}

function getPackageFileCopyCommand(packageManager: ProjectOptions["packageManager"]) {
  return packageManager === "npm" ? "COPY package*.json ./" : "COPY package.json ./";
}

function getPackageManagerRuntime(packageManager: ProjectOptions["packageManager"]) {
  if (packageManager === "yarn") {
    return {
      prepareCommand: "RUN corepack enable",
      installCommand: "yarn install --prefer-offline",
      productionInstallCommand: "yarn install --production --prefer-offline",
      run: "yarn"
    };
  }

  if (packageManager === "pnpm") {
    return {
      prepareCommand: "RUN corepack enable",
      installCommand: "pnpm install --prefer-offline",
      productionInstallCommand: "pnpm install --prod --prefer-offline",
      run: "pnpm"
    };
  }

  return {
    prepareCommand: "",
    installCommand: "npm install --no-audit --no-fund --prefer-offline",
    productionInstallCommand: "npm install --omit=dev --no-audit --no-fund --prefer-offline",
    run: "npm run"
  };
}

async function writeLintingFiles(options: ProjectOptions) {
  const isTs = isTypeScriptProject(options);
  const nodeGlobals = `{
      Buffer: "readonly",
      console: "readonly",
      module: "readonly",
      process: "readonly",
      require: "readonly",
      __dirname: "readonly"
    }`;
  const config = isTs
    ? `import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ignores: ["dist", "coverage", "node_modules", "eslint.config.*"]
  },
  {
    languageOptions: {
      globals: ${nodeGlobals}
    },
    rules: {
      "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
    }
  }
);
`
    : `import js from "@eslint/js";

export default [
  js.configs.recommended,
  {
    ignores: ["dist", "coverage", "node_modules", "eslint.config.*"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: ${nodeGlobals}
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_", "varsIgnorePattern": "^_" }]
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
    npm: ["npm", ["install", "--no-audit", "--no-fund", "--prefer-offline", "--loglevel=error"]],
    yarn: ["yarn", ["install", "--prefer-offline"]],
    pnpm: ["pnpm", ["install", "--prefer-offline"]]
  } as const;

  const [command, args] = commands[options.packageManager];
  await runCommand(command, [...args], options.targetDirectory);
}

function createProjectReadme(options: ProjectOptions) {
  const devCommand = options.framework === "nestjs" ? `${options.packageManager} run start:dev` : `${options.packageManager} run dev`;
  const buildCommand = `${options.packageManager} run build`;
  const installCommand = getInstallCommand(options.packageManager);
  const scripts = getGeneratedScriptDescriptions(options);
  const dockerSection = createDockerReadmeSection(options);

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
${dockerSection}

## Build

${isTypeScriptProject(options) ? `\`\`\`bash
${buildCommand}
\`\`\`` : "This JavaScript project does not require a build step."}

## API Endpoints

- \`GET /\` - Returns API welcome and status information.
- \`GET /health\` - Returns API health status.

## Folder Structure

\`\`\`text
src/
  common/
    http/        # Express and Node.js response helpers
    plugins/     # Fastify app plugins
    middlewares/ # Express and Node.js middleware
    utils/
  config/
  modules/
    health/
  app/server entrypoint
\`\`\`

## Scripts

${scripts.map((script) => `- \`${script.name}\` - ${script.description}`).join("\n")}

## License

MIT
`;
}

function createDockerReadmeSection(options: ProjectOptions) {
  if (!options.includeDocker) {
    return "";
  }

  const databaseNote =
    options.database === "none"
      ? ""
      : `\n\nThe Docker Compose setup includes ${formatLabel(options.database)} and configures \`DATABASE_URL\` for the API service.`;

  return `

## Docker

Run the API with Docker instead of the local development command:

\`\`\`bash
docker compose up --build
\`\`\`

The API container is available at \`http://localhost:3000\`.${databaseNote}
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

function getRunScriptCommand(packageManager: ProjectOptions["packageManager"], script: string) {
  if (packageManager === "yarn") {
    return `yarn ${script}`;
  }

  if (packageManager === "pnpm") {
    return `pnpm ${script}`;
  }

  return `npm run ${script}`;
}

function printSuccessMessage(options: ProjectOptions) {
  const devScript = options.framework === "nestjs" ? "start:dev" : "dev";
  const installCommand = getInstallCommand(options.packageManager);
  const devCommand = getRunScriptCommand(options.packageManager, devScript);
  const footerText = "init-backend-project — created by Choch Kimhour";
  const footerDivider = "─".repeat([...footerText].length);

  logger.plain("");
  logger.success(chalk.bold(`✔ Project created successfully: ${options.projectName}`));
  logger.plain("");

  logger.plain("Next steps");
  logger.plain("----------");
  logger.plain(`    cd ${options.projectName}`);
  logger.plain("");

  if (options.includeDocker) {
    logger.plain("Run with Docker");
    logger.plain("---------------");
    logger.plain("    docker compose up --build");
    logger.plain("");
  } else {
    if (!options.installDependencies) {
      logger.plain("Install dependencies");
      logger.plain("--------------------");
      logger.plain(`    ${installCommand}`);
      logger.plain("");
    }

    logger.plain("Run locally");
    logger.plain("-----------");
    logger.plain(`    ${devCommand}`);
    logger.plain("");
  }

  logger.plain("Endpoints");
  logger.plain("---------");
  logger.plain("    Local API:     http://localhost:3000");
  logger.plain("    Health check:  http://localhost:3000/health");
  logger.plain("");

  logger.plain(footerDivider);
  logger.info(chalk.bold(footerText));
  logger.plain("");
}
