import postgres from "postgres";

export async function up(sql: postgres.Sql<any>) {
  await sql`
    create table users (
      id serial
    )
  `;
}

export async function down(sql: postgres.Sql<any>) {
  await sql`drop table users`;
}
