# init-backend-project

[![npm](https://img.shields.io/badge/npm-init--backend--project-cb3837)](https://www.npmjs.com/package/init-backend-project)
[![version](https://img.shields.io/npm/v/init-backend-project?label=version&color=blue)](https://www.npmjs.com/package/init-backend-project)
[![downloads](https://img.shields.io/badge/downloads-npm-0ea5e9)](https://www.npmjs.com/package/init-backend-project)
[![source](https://img.shields.io/badge/source-GitHub-181717)](https://github.com/chochkimhour/init-backend-project)
[![CI passing](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml/badge.svg)](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

A professional backend project generator for creating clean, runnable Node.js, Express, Fastify, and NestJS starter projects in JavaScript or TypeScript.

`init-backend-project` helps you start a backend project with a practical structure, ready-to-run code, framework templates, environment setup, health checks, error handling, and optional tools such as Docker, testing, linting, authentication, validation, and databases.

## Why Use It

- Start a backend project in seconds instead of creating folders and config files manually.
- Choose the stack you want through simple terminal prompts.
- Generate code that already runs, including an app entry point, server file, routes, controllers, services, middleware, and a health endpoint.
- Keep project structure consistent across Node.js, Express, Fastify, and NestJS projects.
- Add common production-friendly options only when you need them.

## Quick Start

Create a new backend project with `npx`:

```bash
npx init-backend-project my-api
```

`npm install init-backend-project` only installs the package into an existing project. It does not create a new backend app. To generate a project, use `npx`, `npm exec`, or install the CLI globally.

Open the generated project:

```bash
cd my-api
```

Install dependencies if you did not select automatic installation:

```bash
npm install
```

Run the backend:

```bash
npm run dev
```

Open the health check endpoint:

```text
http://localhost:3000/health
```

Example response:

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-04-29T00:00:00.000Z"
}
```

## Usage

Create a new backend project:

```bash
npx init-backend-project my-api
```

Or start the interactive CLI and enter the project name when prompted:

```bash
npx init-backend-project
```

You can also use `npm exec`:

```bash
npm exec init-backend-project my-api
```

Use the CLI often? Install it globally:

```bash
npm install -g init-backend-project
init-backend-project my-api
```

Global installation adds the `init-backend-project` command to your system, so you can create backend projects from any folder without using `npx` each time. Use this option if you plan to generate projects often.

The npm website may show this install command:

```bash
npm install init-backend-project
```

That only installs the package into an existing project. To generate a new backend app, use `npx init-backend-project my-api`, `npm exec init-backend-project my-api`, or the global CLI command.

After the project is created:

```bash
cd my-api
```

Run with your package manager:

```bash
npm install
npm run dev
```

```bash
yarn install
yarn dev
```

```bash
pnpm install
pnpm dev
```

## Example CLI Output

Example when creating an Express project with npm. The banner is orange in supported terminals.

```text
$ npx init-backend-project
 _       _ _     _                _                  _                   _           _
(_)_ __ (_) |_  | |__   __ _  ___| | _____ _ __   __| |  _ __  _ __ ___ (_) ___  ___| |_
| | '_ \| | __| | '_ \ / _` |/ __| |/ / _ \ '_ \ / _` | | '_ \| '__/ _ \| |/ _ \/ __| __|
| | | | | | |_  | |_) | (_| | (__|   <  __/ | | | (_| | | |_) | | | (_) | |  __/ (__| |_
|_|_| |_|_|\__| |_.__/ \__,_|\___|_|\_\___|_| |_|\__,_| | .__/|_|  \___// |\___|\___|\__|
                                                        |_|          |__/

? Project name: my-backend
? Backend framework:
  1. Node.js
> 2. Express
  3. Fastify
  4. NestJS
? Language:
> 1. JavaScript
  2. TypeScript
? Package manager:
> 1. npm
  2. yarn
  3. pnpm
? Database:
> 1. None
  2. PostgreSQL
  3. MySQL
  4. MongoDB
  5. Redis
? ORM:
> 1. None
? Authentication:
> 1. None
  2. JWT Auth
  3. Session Auth
? API documentation:
> 1. None
  2. Swagger / OpenAPI
? Validation:
> 1. None
  2. Zod
  3. Joi
? Include Docker? No
? Include ESLint and Prettier? Yes
? Include testing setup?
> 1. None
  2. Jest
  3. Vitest
? Initialize Git? No
? Install dependencies after generation? Yes
Project files created.
Dependencies installed.

Project created successfully: my-backend

- Next steps
-----------------
  cd my-backend
  npm install
  npm run dev

- API endpoints
-----------------
  Local API:    http://localhost:3000
  Health check: http://localhost:3000/health

-------------------------------------------------------------
Generated by init-backend-project | Created by Choch Kimhour.
```

## What It Creates

The generated project includes real starter backend code, not an empty folder.

Common files and folders:

```text
project-name/
  src/
    config/
    controllers/
    routes/
    middlewares/
    services/
    utils/
    app.js or app.ts
    server.js or server.ts
  .env.example
  .gitignore
  package.json
  README.md
```

TypeScript projects also include:

```text
tsconfig.json
src/types/
```

NestJS projects include a Nest-style structure:

```text
project-name/
  src/
    common/
      decorators/
      dto/
      filters/
      interceptors/
    config/
    modules/
      health/
    app.module.ts
    main.ts
  nest-cli.json
  tsconfig.json
  package.json
  README.md
```

## Features

- Interactive prompts for choosing your backend stack
- Ready-to-run starter code with a health check endpoint
- Clean project structure for routes, controllers, services, middleware, config, and utilities
- JavaScript and TypeScript support
- Node.js, Express, Fastify, and NestJS templates
- Optional database, ORM, authentication, validation, testing, Docker, ESLint, and Prettier setup
- Optional Git initialization and dependency installation
- Generated `.env.example`, `.gitignore`, `package.json`, and project README

## Supported Choices

Frameworks:

- Node.js
- Express
- Fastify
- NestJS

Languages:

- JavaScript
- TypeScript

Package managers:

- npm
- yarn
- pnpm

Databases:

- None
- PostgreSQL
- MySQL
- MongoDB
- Redis

ORMs:

- None
- Prisma
- TypeORM
- Mongoose

Authentication:

- None
- JWT Auth
- Session Auth

Validation:

- None
- Zod
- Joi
- class-validator for NestJS

Testing:

- None
- Jest
- Vitest

## Example Workflow

```bash
npx init-backend-project my-api
cd my-api
npm run dev
```

Then visit:

```text
http://localhost:3000/health
```

That is enough to confirm the generated backend is running.

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
