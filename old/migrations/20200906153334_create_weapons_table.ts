import * as Knex from "knex";
import weapons = require("../utils/weapons");
import grizzcoWeapons = require("../utils/grizzcoWeapons");

const weaponsToInsert = [...weapons, ...grizzcoWeapons];

export async function up(knex: Knex): Promise<void> {
  return knex.schema
    .createTable("weapons", function (table) {
      table.increments();
      table.string("name").notNullable().unique();
    })
    .then(() => {
      return knex("weapons").insert(
        weaponsToInsert.map((weapon) => ({ name: weapon }))
      );
    });
}

export async function down(knex: Knex): Promise<void> {
  return knex.schema.dropTable("weapons");
}
