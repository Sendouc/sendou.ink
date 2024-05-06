import * as Schema from "@effect/schema/Schema";

export const Id = Schema.Number.pipe(Schema.int());

export const PlusTier = Schema.Literal(1, 2, 3);

// xxx: WeaponSplId
export const WeaponSplId = Schema.Number;
