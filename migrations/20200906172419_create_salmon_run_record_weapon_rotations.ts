import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable(
    "salmon_run_record_weapon_rotations",
    function (table) {
      table
        .integer("weapon_id")
        .notNullable()
        .references("id")
        .inTable("weapons")
      table
        .integer("record_id")
        .notNullable()
        .references("id")
        .inTable("salmon_run_records")
      table.unique(["weapon_id", "record_id"])
    }
  )
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmon_run_record_weapon_rotations")
}
