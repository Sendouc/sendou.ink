import * as Knex from "knex"

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable("salmon_run_records", (t) => {
    t.dropColumn("links")
  })
  await knex.schema.alterTable("salmon_run_records", (t) => {
    t.jsonb("links").notNullable()
  })

  await knex.schema.alterTable("salmon_run_record_user_rosters", (t) => {
    t.dropColumn("record_id")
  })
  await knex.schema.alterTable("salmon_run_record_user_rosters", (t) => {
    t.integer("record_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_records")
      .onDelete("CASCADE")
  })

  await knex.schema.alterTable("salmon_run_record_weapon_rotations", (t) => {
    t.dropColumn("record_id")
  })
  await knex.schema.alterTable("salmon_run_record_weapon_rotations", (t) => {
    t.integer("record_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_records")
      .onDelete("CASCADE")
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable("salmon_run_records", (t) => {
    t.dropColumn("links")
  })
  await knex.schema.alterTable("salmon_run_records", (t) => {
    t.specificType("links", "TEXT[]")
  })

  await knex.schema.alterTable("salmon_run_record_user_rosters", (t) => {
    t.dropColumn("record_id")
  })
  await knex.schema.alterTable("salmon_run_record_user_rosters", (t) => {
    t.integer("record_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_records")
  })

  await knex.schema.alterTable("salmon_run_record_weapon_rotations", (t) => {
    t.dropColumn("record_id")
  })
  await knex.schema.alterTable("salmon_run_record_weapon_rotations", (t) => {
    t.integer("record_id")
      .notNullable()
      .references("id")
      .inTable("salmon_run_records")
  })
}
