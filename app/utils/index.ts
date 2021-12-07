import { json } from "remix";
import invariant from "tiny-invariant";

export const makeTitle = (endOfTitle?: string) =>
  endOfTitle ? `sendou.ink | ${endOfTitle}` : "sendou.ink";

// TODO: make context into object to make typoing harder
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

/** Get fields from `request.formData()`. Throw an error if the formData doesn't contain a requested field.  */
export const formDataFromRequest = async <T extends string>({
  request,
  fields,
}: {
  request: Request;
  fields: T[];
}): Promise<Record<T, string>> => {
  const formData = await request.formData();
  let result: Partial<Record<T, string>> = {};

  for (const field of fields) {
    const value = formData.get(field);

    invariant(typeof value === "string", `Expected ${field} to be string`);

    result[field] = value;
  }

  return result as Record<T, string>;
};

export type LoggedInUser = {
  id: string;
  discordId: string;
  discordAvatar: string;
} | null;

export type Serialized<T> = {
  [P in keyof T]: T[P] extends Date
    ? string
    : T[P] extends Date | null
    ? string
    : Serialized<T[P]>;
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
