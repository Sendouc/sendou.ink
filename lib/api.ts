import { User } from "@prisma/client";
import { NextApiRequest } from "next";
import { getSession } from "next-auth/client";

export const getMySession = (req: NextApiRequest): Promise<User | null> =>
  // @ts-expect-error
  getSession({ req });
