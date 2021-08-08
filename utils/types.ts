import { Ability } from "@prisma/client";

export type Unpacked<T> = T extends (infer U)[] ? U : T;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

export type AbilityOrUnknown = Ability | "UNKNOWN";
