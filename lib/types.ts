export type Unpacked<T> = T extends (infer U)[] ? U : T;
