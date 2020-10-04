import * as Knex from "knex";

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmon_run_record_user_rosters", function (
    table
  ) {
    table.integer("user_id").notNullable().references("id").inTable("users");
    table
      .integer("record_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_records");
    table.unique(["user_id", "record_id"]);
  });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmon_run_record_user_rosters");
}
