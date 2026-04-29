# init-backend-project

[![npm](https://img.shields.io/badge/npm-init--backend--project-cb3837)](https://www.npmjs.com/package/init-backend-project)
[![version](https://img.shields.io/badge/version-1.0.0-blue)](https://www.npmjs.com/package/init-backend-project)
[![downloads](https://img.shields.io/npm/dm/init-backend-project?label=downloads&color=0ea5e9)](https://www.npmjs.com/package/init-backend-project)
[![source](https://img.shields.io/badge/source-GitHub-181717)](https://github.com/chochkimhour/init-backend-project)
[![CI](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml/badge.svg)](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml)
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

Create a new backend project:

```bash
npx init-backend-project my-api
```

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

Use any of these styles.

Run with `npx`:

```bash
npx init-backend-project
```

Run with `npx` and pass the project name:

```bash
npx init-backend-project my-api
```

Run with `npm exec`:

```bash
npm exec init-backend-project
```

Install globally:

```bash
npm install -g init-backend-project
```

Then run it anywhere:

```bash
init-backend-project my-api
```

After the project is created:

```bash
cd my-api
```

Run with npm:

```bash
npm install
npm run dev
```

Run with yarn:

```bash
yarn install
yarn dev
```

Run with pnpm:

```bash
pnpm install
pnpm dev
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
