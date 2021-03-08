import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";

const leaveHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      await postHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const userFromDb = await prisma.user.findUnique({
    where: { id: user.id },
    include: { team: true },
  });
  if (!userFromDb?.team || userFromDb.team.captainId === user.id) {
    return res.status(400).end();
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { team: { disconnect: true } },
  });

  res.status(200).end();
}

export default leaveHandler;
