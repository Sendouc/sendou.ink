import type { abilityCodes } from "./abilities";
import type { modes } from "./modes";
import type { stages } from "./stages";

export type ModeShort = typeof modes[number]["short"];

export type Stage = typeof stages[number];

export type Ability = typeof abilityCodes[number]["name"];
export type AbilityWithUnknown =
  | typeof abilityCodes[number]["name"]
  | "UNKNOWN";
export type AbilityType = typeof abilityCodes[number]["type"];

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
