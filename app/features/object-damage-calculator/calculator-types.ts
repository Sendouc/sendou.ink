import type { DAMAGE_RECEIVERS } from "./calculator-constants";

export type DamageReceiver = typeof DAMAGE_RECEIVERS[number];

export type HitPoints = Record<DamageReceiver, number>;
