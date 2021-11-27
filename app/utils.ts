export const makeTitle = (endOfTitle: string) => `sendou.ink | ${endOfTitle}`;

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

// TODO:
// export type InferredSerializedAPI<T> = Serialized<Prisma.PromiseReturnType<T>>;
