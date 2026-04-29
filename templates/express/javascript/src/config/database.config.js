const databaseConfig = {
  provider: "{{DATABASE}}",
  orm: "{{ORM}}",
  url: process.env.DATABASE_URL || ""
};

module.exports = { databaseConfig };
