import * as Knex from "knex"
import {
  salmonRunRecordWildcards,
  salmonRunRecordCategories,
} from "../utils/enums"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("salmon_run_records", function (table) {
    table.increments()
    table.boolean("approved").notNullable()
    table.integer("golden_egg_count").notNullable()
    table.enu("wildcards", salmonRunRecordWildcards)
    table.enu("category", salmonRunRecordCategories).notNullable()
    table
      .integer("stage_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_stages")
    table.integer("grizzco_weapon_id").references("id").inTable("weapons")
    table.specificType("links", "TEXT[]")
    table.timestamp("created_at").defaultTo(knex.fn.now())
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmon_run_records")
}
