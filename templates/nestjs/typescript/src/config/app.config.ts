export default () => ({
  env: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 3000),
  corsOrigin: process.env.CORS_ORIGIN ?? "*",
  database: {
    provider: "{{DATABASE}}",
    orm: "{{ORM}}",
    url: process.env.DATABASE_URL ?? ""
  },
  auth: {
    type: "{{AUTH_TYPE}}",
    jwtSecret: process.env.JWT_SECRET ?? "",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? "1d"
  }
});
