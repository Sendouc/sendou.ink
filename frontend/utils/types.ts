// https://stackoverflow.com/a/52910586
export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};
