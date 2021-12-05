import { json, useMatches } from "remix";

export const makeTitle = (endOfTitle?: string) =>
  endOfTitle ? `sendou.ink | ${endOfTitle}` : "sendou.ink";

/** Get logged in user from context. Throws with 401 error if no user found. */
export const requireUser = (ctx: any) => {
  const user = ctx.user;

  if (!user) {
    throw json("Log in required", { status: 401 });
  }

  return user as NonNullable<LoggedInUser>;
};

/** Get logged in user from context. Doesn't throw. */
export const getUser = (ctx: any) => {
  const user = ctx.user;

  return user as LoggedInUser;
};

export type LoggedInUser = {
  id: string;
  discordId: string;
  discordAvatar: string;
} | null;

export const useUser = () => {
  const [root] = useMatches();

  return root.data.user as LoggedInUser;
};

export const useBaseURL = () => {
  const [root] = useMatches();

  return root.data.baseURL as string;
};

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date ? string : Serialized<T[P]>;
};

export type Unpacked<T> = T extends (infer U)[]
  ? U
  : T extends (...args: any[]) => infer U
  ? U
  : T extends Promise<infer U>
  ? U
  : T;

// TODO:
// export type InferredSerializedAPI<T> = Serialized<Prisma.PromiseReturnType<T>>;
