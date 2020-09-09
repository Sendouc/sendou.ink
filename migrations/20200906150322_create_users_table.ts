import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function (table) {
    table.increments()
    table.string("username", 32).notNullable()
    table.string("discriminator", 4).notNullable()
    table.string("discord_id", 18).notNullable().unique()
    table.string("discord_avatar")
    //table.string('avatar');
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users")
}
