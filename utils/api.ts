import { User } from "@prisma/client";
import { NextApiRequest } from "next";
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
