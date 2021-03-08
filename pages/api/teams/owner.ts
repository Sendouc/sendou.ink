import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";

const ownerHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const userToMakeOwner = await prisma.user.findUnique({
    where: { id: req.body.id },
    include: { team: true },
  });
  if (
    !userToMakeOwner ||
    !userToMakeOwner.team ||
    userToMakeOwner.team.captainId !== user.id
  ) {
    return res.status(400).end();
  }

  await prisma.team.update({
    where: { id: userToMakeOwner.team.id },
    data: { captain: { connect: { id: req.body.id } } },
  });

  res.status(200).end();
}

export default ownerHandler;
