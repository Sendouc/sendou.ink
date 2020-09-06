import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmonRunRecordWeaponRotations", function (
    table
  ) {
    table.integer("weaponId").notNullable().references("id").inTable("weapons")
    table
      .integer("recordId")
      .notNullable()
      .references("id")
      .inTable("salmonRunRecords")
    table.unique(["weaponId", "recordId"])
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmonRunRecordWeaponRotations")
}
