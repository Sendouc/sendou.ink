import { migrate } from "postgres-migrations";

async function main() {
  const dbConfig = {
    // TODO: env vars
    database: "sendou_ink_postgraphile",
    user: "sendou",
    password: "password",
    host: "localhost",
    port: 5432,
    ensureDatabaseExists: true,
    defaultDatabase: "postgres",
  };

  await migrate(dbConfig, "migrations");
}

main().then(() => console.log("Migrations done"));
