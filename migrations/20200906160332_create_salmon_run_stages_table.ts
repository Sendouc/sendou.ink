import * as Knex from "knex"
import srMaps = require("../utils/srMaps")

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("salmonRunStages", function (table) {
      table.increments()
      table.string("name").notNullable().unique()
    })
    .then(() => {
      return knex("stages").insert(srMaps.map((stage) => ({ name: stage })))
    })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("salmonRunStages")
}
