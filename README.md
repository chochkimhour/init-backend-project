# init-backend-project

[![npm](https://img.shields.io/badge/npm-init--backend--project-cb3837)](https://www.npmjs.com/package/init-backend-project)
[![version](https://img.shields.io/npm/v/init-backend-project?label=version&color=blue)](https://www.npmjs.com/package/init-backend-project)
[![downloads](https://img.shields.io/badge/downloads-1.5k%2Fmonth-brightgreen)](https://www.npmjs.com/package/init-backend-project)
[![source](https://img.shields.io/badge/source-GitHub-181717)](https://github.com/chochkimhour/init-backend-project)
[![CI passing](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml/badge.svg)](https://github.com/chochkimhour/init-backend-project/actions/workflows/ci.yml)
[![license](https://img.shields.io/badge/license-MIT-green)](LICENSE)

Create clean, runnable backend starter projects for Node.js, Express, Fastify, and NestJS with one interactive CLI.

`init-backend-project` generates real starter code with framework-specific app startup, a health endpoint, environment config, consistent response helpers, error handling, and optional setup for Docker Compose, testing, linting, validation, authentication, databases, and ORMs.

## Requirements

- Node.js 18.17 or newer
- npm, yarn, or pnpm

## Quick Start

Create a backend project:

```bash
npx init-backend-project my-api
```

Open it and run the server:

```bash
cd my-api
npm install
npm run dev
```

If you choose automatic dependency installation during setup, you can skip `npm install`.

Open the health check:

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

Run with `npx`:

```bash
npx init-backend-project my-api
```

Run the interactive prompt without a project name:

```bash
npx init-backend-project
```

Use `npm exec`:

```bash
npm exec init-backend-project my-api
```

Install globally if you generate projects often:

```bash
npm install -g init-backend-project
init-backend-project my-api
```

Note: `npm install init-backend-project` only installs this package into the current project. To create a new backend app, use `npx`, `npm exec`, or the global CLI command.

## What It Generates

Every generated project includes a practical backend foundation:

- App and server entry points
- Environment configuration
- Health check endpoint
- Centralized error and not-found handling
- Consistent JSON response helpers
- Feature-based module structure
- Generated `.env.example`, `.gitignore`, `package.json`, and `README.md`

Express, Fastify, and raw Node.js projects use this structure:

```text
project-name/
  src/
    common/
      http/        # Express and Node.js response helpers
      plugins/     # Fastify app plugins
      middlewares/ # Express and Node.js middleware
      utils/
    config/
    modules/
      health/
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

NestJS projects use a Nest-style structure:

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
  tsconfig.json
  package.json
  README.md
```

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

API documentation:

- None
- Swagger / OpenAPI

Validation:

- None
- Zod
- Joi
- class-validator for NestJS

Testing:

- None
- Jest
- Vitest

Optional tools:

- Docker and Docker Compose
- ESLint and Prettier
- Git initialization
- Dependency installation

## Package Manager Commands

Run the generated project with your selected package manager:

```bash
npm run dev
```

```bash
yarn dev
```

```bash
pnpm dev
```

When the server starts, the terminal prints the framework and health check URLs:

```text
[my-api] Express API running on http://localhost:3000
[my-api] Health check: http://localhost:3000/health
```

Build TypeScript projects:

```bash
npm run build
```

NestJS projects also support the familiar alias:

```bash
npm run start:dev
```

## Example CLI Flow

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
? Include Docker and Docker Compose? (Yes/No)
  Yes
> No
? Include ESLint and Prettier? (Yes/No)
> Yes
  No
? Include testing setup?
> 1. None
  2. Jest
  3. Vitest
? Initialize Git repository? (Yes/No)
  Yes
> No
? Install dependencies after generation? (Yes/No)
> Yes
  No
Project files created.
Dependencies installed.

Project created successfully: my-backend

- Next steps
    cd my-backend

- Run locally
    npm run dev

- API endpoints
    Local API:    http://localhost:3000
    Health check: http://localhost:3000/health

init-backend-project — created by Choch Kimhour.
```

## License

MIT License.

Copyright (c) 2026 Choch Kimhour.
