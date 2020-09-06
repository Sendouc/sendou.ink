import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmonRunRecords", function (table) {
    table.increments()
    table.boolean("approved").notNullable()
    table.integer("goldenEggCount").notNullable()
    table.enu("wildcards", ["1_WILDCARD", "4_WILCARDS", "4_GOLDEN_WILDCARDS"])
    table
      .enu("category", [
        "TOTAL",
        "TOTAL_NO_NIGHT",
        "PRINCESS",
        "NT_NORMAL",
        "HT_NORMAL",
        "LT_NORMAL",
        "NT_RUSH",
        "HT_RUSH",
        "LT_RUSH",
        "NT_FOG",
        "HT_FOG",
        "LT_FOG",
        "NT_GOLDIE",
        "HT_GOLDIE",
        "LT_GOLDIE",
        "NT_GRILLERS",
        "HT_GRILLERS",
        "LT_GRILLERS",
        "NT_MOTHERSHIP",
        "HT_MOTHERSHIP",
        "LT_MOTHERSHIP",
        "LT_COHOCK",
      ])
      .notNullable()
    table
      .integer("stageId")
      .notNullable()
      .references("id")
      .inTable("salmonRunStages")
    table.integer("grizzcoWeaponId").references("id").inTable("weapons")
    table.specificType("links", "TEXT[]")
    table.timestamp("createdAt").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmonRunRecords")
}
