import * as Knex from "knex";
import srMaps = require("../utils/srMaps");

export async function up(knex: Knex): Promise<void> {
  await knex("stages").where("id", ">", "23").del();
  await knex("salmon_run_stages").insert(
    srMaps.map((stage) => ({ name: stage }))
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex("salmon_run_stages").where("*").del();
  await knex("stages").insert(srMaps.map((stage) => ({ name: stage })));
}
