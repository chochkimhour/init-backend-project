# init-backend-project

A professional backend project scaffolding CLI for JavaScript and TypeScript.

`init-backend-project` helps you generate a clean backend starter with a framework, language, database, authentication, validation, Docker, linting, and testing choices selected interactively in your terminal.

## Usage

Run with npx:

```bash
npx init-backend-project
```

Or with npm exec:

```bash
npm exec init-backend-project
```

You can also pass the project name up front:

```bash
npx init-backend-project my-api
```

## Supported Frameworks

- Express
- Fastify
- NestJS
- Node.js

## Supported Languages

- JavaScript
- TypeScript

NestJS projects are generated as TypeScript projects.

## Features

- Interactive terminal prompts
- npm package name validation
- Existing folder overwrite confirmation
- Framework-specific templates
- Health check endpoint at `GET /health`
- CORS support
- JSON request body support
- Environment variables with dotenv or Nest config
- Request logging
- Global error handling
- 404 handling
- Optional Docker files
- Optional ESLint and Prettier
- Optional Jest or Vitest setup
- Optional Git initialization
- Optional dependency installation
- Project README generation

## CLI Options

The CLI asks for:

- Project name
- Language: JavaScript or TypeScript
- Backend framework: Express, Fastify, or NestJS
- Package manager: npm, yarn, or pnpm
- Database: None, PostgreSQL, MySQL, MongoDB (NoSQL), or Redis
- ORM: None, Prisma, TypeORM, or Mongoose
- Authentication: None, JWT Auth, or Session Auth
- API documentation: None or Swagger / OpenAPI
- Validation: None, Zod, Joi, or class-validator for NestJS
- Docker inclusion
- ESLint and Prettier inclusion
- Testing setup: None, Jest, or Vitest
- Git initialization
- Dependency installation

## Generated Project Structure

Node.js, Express, and Fastify JavaScript projects:

```text
project-name/
  src/
    config/
    controllers/
    routes/
    middlewares/
    services/
    utils/
    app.js
    server.js
  .env.example
  .gitignore
  package.json
  README.md
```

Node.js, Express, and Fastify TypeScript projects:

```text
project-name/
  src/
    config/
    controllers/
    routes/
    middlewares/
    services/
    utils/
    types/
    app.ts
    server.ts
  .env.example
  .gitignore
  tsconfig.json
  package.json
  README.md
```

NestJS projects:

```text
project-name/
  src/
    common/
      filters/
      interceptors/
      decorators/
      dto/
    config/
    modules/
      health/
    app.module.ts
    main.ts
  .env.example
  .gitignore
  nest-cli.json
  tsconfig.json
  package.json
  README.md
```

## Example Output

After generation:

```bash
cd my-api
npm run dev
```

The API will run at:

```text
http://localhost:3000
```

Health check:

```text
http://localhost:3000/health
```

Example health response:

```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-04-29T00:00:00.000Z"
}
```

## Development

Install dependencies:

```bash
npm install
```

Run the CLI locally:

```bash
npm run dev
```

Build:

```bash
npm run build
```

## Publishing to npm

Before publishing, make sure you are logged in:

```bash
npm login
```

Then publish:

```bash
npm publish
```

The package is configured with:

```json
{
  "bin": {
    "init-backend-project": "dist/cli.js"
  },
  "files": ["dist", "templates", "README.md", "LICENSE"]
}
```

`prepublishOnly` runs the TypeScript build before publishing.

## License

MIT
