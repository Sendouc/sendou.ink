import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmonRunRecordUserRosters", function (
    table
  ) {
    table.integer("userId").notNullable().references("id").inTable("users")
    table
      .integer("recordId")
      .notNullable()
      .references("id")
      .inTable("salmonRunRecords")
    table.unique(["userId", "recordId"])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmonRunRecordUserRosters")
}
