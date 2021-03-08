import { Ability } from "@prisma/client";

export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type AbilityOrUnknown = Ability | "UNKNOWN";
