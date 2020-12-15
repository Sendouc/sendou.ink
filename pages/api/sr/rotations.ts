import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const rotationsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const rotations = await prisma.salmonRunRotation.findMany({
    where: { startTime: { lt: new Date() } },
    orderBy: { id: "desc" },
    select: { id: true, startTime: true, weapons: true, stage: true },
  });

  res.status(200).json(rotations);
};

export default rotationsHandler;
