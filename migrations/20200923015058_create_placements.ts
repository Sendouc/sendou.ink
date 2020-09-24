import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("x_rank_placements", function (table) {
    table.increments()
    table.string("player_id").notNullable()
    table.string("player_name").notNullable().index()
    table.integer("ranking").notNullable()
    table.integer("x_power").notNullable()
    table.enu("mode", ["SZ", "TC", "RM", "CB"]).notNullable()
    table.integer("month").notNullable()
    table.integer("year").notNullable()
    table.integer("weapon_id").notNullable().references("id").inTable("weapons")

    table.unique(["player_id", "mode", "month", "year"])
  })

  await knex.schema.alterTable("users", function (table) {
    table.string("player_id").unique()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("x_rank_placements")

  await knex.schema.alterTable("users", function (table) {
    table.dropColumn("player_id")
  })
}
