import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";
import { TEAM_ROSTER_LIMIT } from "utils/constants";

const joinHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const { code, name } = req.body;

  if (typeof code !== "string" || typeof name !== "string") {
    return res.status(400).end();
  }

  const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });

  if (userFromDb?.teamId) {
    return res.status(400).json({ message: "Already in a team" });
  }

  const team = await prisma.team.findUnique({
    where: { inviteCode: code },
    include: { roster: true },
  });

  if (!team || team.nameForUrl !== name) {
    return res.status(400).end();
  }

  if (team.roster.length >= TEAM_ROSTER_LIMIT) {
    return res.status(400).json({ message: "Team already has 10 members" });
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { roster: { connect: { id: user.id } } },
  });

  res.status(200).end();
}

export default joinHandler;
