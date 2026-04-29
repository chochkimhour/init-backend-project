export type Language = "javascript" | "typescript";

export type Framework = "nodejs" | "express" | "fastify" | "nestjs";

export type PackageManager = "npm" | "yarn" | "pnpm";

export type Database = "none" | "postgresql" | "mysql" | "mongodb" | "redis";

export type Orm = "none" | "prisma" | "typeorm" | "mongoose";

export type AuthType = "none" | "jwt" | "session";

export type ApiDocs = "none" | "swagger";

export type Validation = "none" | "zod" | "joi" | "class-validator";

export type Testing = "none" | "jest" | "vitest";

export interface ProjectOptions {
  projectName: string;
  targetDirectory: string;
  language: Language;
  framework: Framework;
  packageManager: PackageManager;
  database: Database;
  orm: Orm;
  authType: AuthType;
  apiDocs: ApiDocs;
  validation: Validation;
  includeDocker: boolean;
  includeLinting: boolean;
  testing: Testing;
  initGit: boolean;
  installDependencies: boolean;
  overwrite: boolean;
}
