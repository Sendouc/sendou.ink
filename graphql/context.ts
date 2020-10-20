import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";
import { getSession } from "next-auth/client";

const prisma = new PrismaClient({ log: ["query"] });

export interface Context {
  prisma: PrismaClient;
  // FIXME: type
  session: any;
}

export const createContext = async (req: NextApiRequest): Promise<Context> => {
  const session = await getSession({ req });

  console.log({ session });

  return {
    prisma,
    session,
  };
};
