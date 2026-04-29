const LABELS = {
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
export function formatLabel(value) {
    return LABELS[value] ?? value.charAt(0).toUpperCase() + value.slice(1);
}
//# sourceMappingURL=labels.js.map