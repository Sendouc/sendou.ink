import { getMySession } from "lib/getMySession";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const kickHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

  if (typeof req.body.id !== "number") return res.status(400).end();

  const userToKick = await prisma.user.findUnique({
    where: { id: req.body.id },
    include: { team: true },
  });
  if (
    !userToKick ||
    !userToKick.team ||
    userToKick.team.captainId !== user.id
  ) {
    return res.status(400).end();
  }

  await prisma.user.update({
    where: { id: req.body.id },
    data: { team: { disconnect: true } },
  });

  res.status(200).end();
}

export default kickHandler;
