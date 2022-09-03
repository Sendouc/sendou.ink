import type { abilities } from "./abilities";
import type { modes } from "./modes";
import type { stages } from "./stages";

export type ModeShort = typeof modes[number]["short"];

export type Stage = typeof stages[number];

export type Ability = typeof abilities[number]["name"];
export type AbilityWithUnknown = typeof abilities[number]["name"] | "UNKNOWN";
export type AbilityType = typeof abilities[number]["type"];

export type BuildAbilitiesTuple = [
  head: [main: Ability, s1: Ability, s2: Ability, s3: Ability],
  clothes: [main: Ability, s1: Ability, s2: Ability, s3: Ability],
  shoes: [main: Ability, s1: Ability, s2: Ability, s3: Ability]
];
export type BuildAbilitiesTupleWithUnknown = [
  head: [
    main: AbilityWithUnknown,
    s1: AbilityWithUnknown,
    s2: AbilityWithUnknown,
    s3: AbilityWithUnknown
  ],
  clothes: [
    main: AbilityWithUnknown,
    s1: AbilityWithUnknown,
    s2: AbilityWithUnknown,
    s3: AbilityWithUnknown
  ],
  shoes: [
    main: AbilityWithUnknown,
    s1: AbilityWithUnknown,
    s2: AbilityWithUnknown,
    s3: AbilityWithUnknown
  ]
];
