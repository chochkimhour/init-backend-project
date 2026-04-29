import path from "node:path";
import fs from "fs-extra";
import ora from "ora";
import { applyTemplateReplacements, getTemplateDirectory } from "./templates.js";
import { logger } from "./utils/logger.js";
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
export async function generateProject(options) {
    if (await fs.pathExists(options.targetDirectory)) {
        if (!options.overwrite) {
            throw new Error(`Folder "${options.projectName}" already exists.`);
        }
        await fs.emptyDir(options.targetDirectory);
    }
    else {
        await fs.ensureDir(options.targetDirectory);
    }
    const spinner = ora("Creating project files...").start();
    try {
        await copyTemplate(options);
        await writeJson(path.join(options.targetDirectory, "package.json"), createPackageJson(options));
        await fs.writeFile(path.join(options.targetDirectory, "README.md"), createProjectReadme(options));
        await fs.writeFile(path.join(options.targetDirectory, ".env.example"), createEnvExample(options));
        await fs.writeFile(path.join(options.targetDirectory, ".gitignore"), createGitignore());
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
    }
    catch (error) {
        spinner.fail("Failed to create project files.");
        throw error;
    }
    if (options.installDependencies) {
        const installSpinner = ora(`Installing dependencies with ${options.packageManager}...`).start();
        try {
            await installDependencies(options);
            installSpinner.succeed("Dependencies installed.");
        }
        catch (error) {
            installSpinner.fail("Dependency installation failed.");
            throw error;
        }
    }
    if (options.initGit) {
        const gitSpinner = ora("Initializing Git repository...").start();
        try {
            await runCommand("git", ["init"], options.targetDirectory);
            gitSpinner.succeed("Git repository initialized.");
        }
        catch {
            gitSpinner.text = "Could not initialize Git. You can run git init manually.";
            gitSpinner.warn();
        }
    }
    printSuccessMessage(options);
}
async function copyTemplate(options) {
    const templateDirectory = getTemplateDirectory(options.framework, options.language);
    if (!(await fs.pathExists(templateDirectory))) {
        throw new Error(`Template not found: ${templateDirectory}`);
    }
    await fs.copy(templateDirectory, options.targetDirectory);
    const files = await listFiles(options.targetDirectory);
    await Promise.all(files.map(async (file) => {
        if (!isTextTemplate(file)) {
            return;
        }
        const content = await fs.readFile(file, "utf8");
        await fs.writeFile(file, applyTemplateReplacements(content, options));
    }));
}
async function listFiles(directory) {
    const entries = await fs.readdir(directory, { withFileTypes: true });
    const files = await Promise.all(entries.map((entry) => {
        const fullPath = path.join(directory, entry.name);
        return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    }));
    return files.flat();
}
function isTextTemplate(file) {
    const basename = path.basename(file);
    return TEXT_EXTENSIONS.has(path.extname(file)) || basename.startsWith(".env") || basename.startsWith(".git");
}
function createPackageJson(options) {
    const isTs = options.language === "typescript" || options.framework === "nestjs";
    const dependencies = new Set();
    const devDependencies = new Set();
    const scripts = {};
    if (options.framework === "express") {
        ["express", "cors", "dotenv", "morgan"].forEach((dependency) => dependencies.add(dependency));
        if (isTs) {
            ["@types/express", "@types/cors", "@types/morgan"].forEach((dependency) => devDependencies.add(dependency));
        }
        else {
            devDependencies.add("nodemon");
        }
    }
    if (options.framework === "nodejs") {
        dependencies.add("dotenv");
        if (!isTs) {
            devDependencies.add("nodemon");
        }
    }
    if (options.framework === "fastify") {
        ["fastify", "@fastify/cors", "dotenv"].forEach((dependency) => dependencies.add(dependency));
        if (!isTs) {
            devDependencies.add("nodemon");
        }
    }
    if (options.framework === "nestjs") {
        [
            "@nestjs/common",
            "@nestjs/core",
            "@nestjs/platform-express",
            "@nestjs/config",
            "reflect-metadata",
            "rxjs"
        ].forEach((dependency) => dependencies.add(dependency));
        ["@nestjs/cli", "@nestjs/schematics"].forEach((dependency) => devDependencies.add(dependency));
    }
    addDatabaseDependencies(options, dependencies, devDependencies);
    addFeatureDependencies(options, dependencies, devDependencies);
    if (isTs) {
        ["typescript", "tsx", "@types/node"].forEach((dependency) => devDependencies.add(dependency));
    }
    if (options.includeLinting) {
        ["eslint", "prettier", "@eslint/js", "typescript-eslint"].forEach((dependency) => devDependencies.add(dependency));
    }
    if (options.testing === "jest") {
        devDependencies.add("jest");
        if (isTs) {
            devDependencies.add("ts-jest");
            devDependencies.add("@types/jest");
        }
    }
    if (options.testing === "vitest") {
        devDependencies.add("vitest");
    }
    if (options.framework === "nestjs") {
        scripts.start = "nest start";
        scripts["start:dev"] = "nest start --watch";
        scripts.build = "nest build";
    }
    else if (isTs) {
        scripts.dev = "tsx watch src/server.ts";
        scripts.build = "tsc";
        scripts.start = "node dist/server.js";
    }
    else {
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
    return {
        name: options.projectName,
        version: "1.0.0",
        description: `Backend API generated with init-backend-project.`,
        type: options.language === "javascript" && options.framework !== "nestjs" ? "commonjs" : "module",
        main: options.framework === "nestjs" ? "dist/main.js" : isTs ? "dist/server.js" : "src/server.js",
        scripts,
        dependencies: toVersionMap(dependencies),
        devDependencies: toVersionMap(devDependencies),
        license: "MIT"
    };
}
function addDatabaseDependencies(options, dependencies, devDependencies) {
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
function addFeatureDependencies(options, dependencies, devDependencies) {
    if (options.authType === "jwt") {
        dependencies.add("jsonwebtoken");
        dependencies.add("bcryptjs");
        if (options.language === "typescript" || options.framework === "nestjs") {
            devDependencies.add("@types/jsonwebtoken");
            devDependencies.add("@types/bcryptjs");
        }
    }
    if (options.apiDocs === "swagger") {
        if (options.framework === "nestjs") {
            dependencies.add("@nestjs/swagger");
            dependencies.add("swagger-ui-express");
        }
        else {
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
function toVersionMap(dependencies) {
    return Object.fromEntries([...dependencies].sort().map((dependency) => [dependency, "latest"]));
}
async function writeJson(file, value) {
    await fs.writeJson(file, value, { spaces: 2 });
}
function createEnvExample(options) {
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
async function writeDockerFiles(options) {
    const isTs = options.language === "typescript" || options.framework === "nestjs";
    const startCommand = options.framework === "nestjs" ? "npm run start" : isTs ? "npm run build && npm run start" : "npm run start";
    await fs.writeFile(path.join(options.targetDirectory, "Dockerfile"), `FROM node:22-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3000
CMD ["sh", "-c", "${startCommand}"]
`);
    await fs.writeFile(path.join(options.targetDirectory, ".dockerignore"), `node_modules
dist
coverage
.env
.git
`);
}
async function writeLintingFiles(options) {
    const isTs = options.language === "typescript" || options.framework === "nestjs";
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
async function writeTestingFiles(options) {
    if (options.testing === "jest") {
        const isTs = options.language === "typescript" || options.framework === "nestjs";
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
        await fs.writeFile(path.join(options.targetDirectory, fileName), config);
    }
    if (options.testing === "vitest") {
        await fs.writeFile(path.join(options.targetDirectory, "vitest.config.ts"), `import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node"
  }
});
`);
    }
}
async function installDependencies(options) {
    const commands = {
        npm: ["npm", ["install"]],
        yarn: ["yarn", ["install"]],
        pnpm: ["pnpm", ["install"]]
    };
    const [command, args] = commands[options.packageManager];
    await runCommand(command, [...args], options.targetDirectory);
}
function createProjectReadme(options) {
    const devCommand = options.framework === "nestjs" ? `${options.packageManager} run start:dev` : `${options.packageManager} run dev`;
    const buildCommand = `${options.packageManager} run build`;
    const installCommand = getInstallCommand(options.packageManager);
    return `# ${options.projectName}

Backend API generated with init-backend-project.

## Stack

- Framework: ${label(options.framework)}
- Language: ${label(options.framework === "nestjs" ? "typescript" : options.language)}
- Database: ${label(options.database)}
- ORM: ${label(options.orm)}
- Authentication: ${label(options.authType)}
- API documentation: ${label(options.apiDocs)}
- Validation: ${label(options.validation)}
- Testing: ${label(options.testing)}

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

${options.language === "typescript" || options.framework === "nestjs" ? `\`\`\`bash
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

- \`dev\` or \`start:dev\` - Run the development server
- \`start\` - Run the production server
- \`build\` - Compile TypeScript projects
- \`lint\` - Run ESLint when included
- \`test\` - Run tests when included

## License

MIT
`;
}
function getInstallCommand(packageManager) {
    if (packageManager === "yarn") {
        return "yarn install";
    }
    if (packageManager === "pnpm") {
        return "pnpm install";
    }
    return "npm install";
}
function label(value) {
    const labels = {
        express: "Express",
        nodejs: "Node.js",
        fastify: "Fastify",
        nestjs: "NestJS",
        javascript: "JavaScript",
        typescript: "TypeScript",
        none: "None",
        postgresql: "PostgreSQL",
        mysql: "MySQL",
        mongodb: "MongoDB",
        redis: "Redis",
        prisma: "Prisma",
        typeorm: "TypeORM",
        mongoose: "Mongoose",
        jwt: "JWT Auth",
        session: "Session Auth",
        swagger: "Swagger / OpenAPI",
        zod: "Zod",
        joi: "Joi",
        "class-validator": "class-validator",
        jest: "Jest",
        vitest: "Vitest"
    };
    return labels[value] ?? value;
}
function printSuccessMessage(options) {
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
//# sourceMappingURL=generator.js.map