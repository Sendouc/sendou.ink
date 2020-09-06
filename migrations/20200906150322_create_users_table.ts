import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  return knex.schema.createTable("users", function (table) {
    table.increments()
    table.string("username", 32).notNullable()
    table.string("discriminator", 4).notNullable()
    table.string("discordId", 18).notNullable().unique()
    table.string("discordAvatar")
    //table.string('avatar');
  })
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("users")
}
