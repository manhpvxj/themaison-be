const { DataSource } = require("typeorm");
require("dotenv").config();

const AppDataSource = new DataSource({
  type: "postgres",
  port: 5432,
  host: process.env.DB_HOST,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false,
  },
  entities: [
    "dist/models/*.js",
    "node_modules/@medusajs/medusa/dist/models/!(*.index.js)",
  ],
  migrations: [
    "dist/migrations/*.js",
    "node_modules/@medusajs/medusa/dist/migrations/*.js",
  ],
});

module.exports = {
  datasource: AppDataSource,
};
