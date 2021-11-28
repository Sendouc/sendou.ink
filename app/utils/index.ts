import { json } from "remix";

export const makeTitle = (endOfTitle: string) => `sendou.ink | ${endOfTitle}`;

export const requireUser = (ctx: any) => {
  const user = ctx.user;

  if (!user) {
    throw json("Log in required", { status: 401 });
  }

  return user as NonNullable<LoggedInUser>;
};

export type LoggedInUser = {
  id: number;
  discordId: string;
  discordAvatar: string;
} | null;

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

// TODO:
// export type InferredSerializedAPI<T> = Serialized<Prisma.PromiseReturnType<T>>;
