import { PrismaClient } from "@prisma/client";
import { NextApiRequest, NextApiResponse } from "next";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";

const prisma = new PrismaClient();

const userHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetUserByIdentifierData>
) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const user = await getUserByIdentifier(
    prisma,
    req.query.identifier as string
  );
  if (!user) return res.status(404).end();
  res.status(200).json(user);
};

export default userHandler;
