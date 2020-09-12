import * as Knex from "knex"
import { salmonRunRecordWildcards } from "../utils/enums"

const formatAlterTableEnumSql = (
  tableName: string,
  columnName: string,
  enums: string[]
) => {
  const constraintName = `${tableName}_${columnName}_check`
  return [
    `ALTER TABLE ${tableName} DROP CONSTRAINT IF EXISTS ${constraintName};`,
    `ALTER TABLE ${tableName} ADD CONSTRAINT ${constraintName} CHECK (${columnName} = ANY (ARRAY['${enums.join(
      "'::text, '"
    )}'::text]));`,
  ].join("\n")
}

export async function up(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql(
      "salmon_run_records",
      "wildcards",
      salmonRunRecordWildcards
    )
  )
}

export async function down(knex: Knex): Promise<void> {
  await knex.raw(
    formatAlterTableEnumSql(
      "salmon_run_records",
      "wildcards",
      salmonRunRecordWildcards.map((wildcard) =>
        wildcard.replace("ONE", "1").replace("FOUR", "4")
      )
    )
  )
}
