import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmonRunRecords", function (table) {
    table.increments()
    table.integer("goldenEggCount").notNullable()
    table.enu("wildcards", ["1_WILDCARD", "4_WILCARDS", "4_GOLDEN_WILDCARDS"])
    table
      .integer("stageId")
      .notNullable()
      .references("id")
      .inTable("salmonRunStages")
    table.integer("grizzcoWeaponId").references("id").inTable("weapons")
    table.specificType("links", "TEXT[]")
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmonRunRecords")
}
