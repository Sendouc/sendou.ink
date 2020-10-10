import * as Knex from "knex";
import maps = require("../utils/maps");

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("stages", function (table) {
      table.increments();
      table.string("name").notNullable().unique();
    })
    .then(() => {
      return knex("stages").insert(maps.map((stage) => ({ name: stage })));
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("stages");
}
