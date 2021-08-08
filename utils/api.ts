import { User } from "@prisma/client";
import { httpError } from "@trpc/server";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/client";

export const getMySession = (req: NextApiRequest): Promise<User | null> => {
  if (
    process.env.NODE_ENV === "development" &&
    req.headers.cookie?.includes("mockUser=")
  ) {
    return JSON.parse(req.headers.cookie.replace("mockUser=", ""));
  }

  // @ts-expect-error
  return getSession({ req });
};

export const throwIfNotLoggedIn = (user: User | null) => {
  if (!user) throw httpError.unauthorized();

  return user;
};

export const createHandler = (
  req: NextApiRequest,
  res: NextApiResponse,
  handlers: Partial<
    Record<
      "GET" | "POST" | "PUT" | "DELETE",
      (req: NextApiRequest, res: NextApiResponse) => Promise<any>
    >
  >
) => {
  if (Object.keys(handlers).includes(req.method as any)) {
    const key = req.method as keyof typeof handlers;
    return handlers[key]!(req, res);
  }

  return res.status(405).end();
};

export class UserInputError extends Error {
  constructor(msg: string) {
    super(msg);
    Object.setPrototypeOf(this, UserInputError.prototype);
  }
}
