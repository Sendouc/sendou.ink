import { PrismaClient } from "@prisma/client";
import { NextApiRequest } from "next";

const prisma = new PrismaClient({ log: ["query"] });

export interface Context {
  prisma: PrismaClient;
  req?: NextApiRequest;
}

export const createContext = ({ req }: { req: NextApiRequest }): Context => ({
  prisma,
  req,
});
