import { getMySession } from "lib/api";
import { LADDER_ROSTER_LIMIT } from "lib/constants";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

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

  const { code } = req.body;

  if (typeof code !== "string") {
    return res.status(400).end();
  }

  const userFromDb = await prisma.user.findUnique({ where: { id: user.id } });

  if (userFromDb?.ladderTeamId) {
    return res.status(400).json({ message: "Already in a team" });
  }

  const team = await prisma.ladderRegisteredTeam.findUnique({
    where: { inviteCode: code },
    include: { roster: true },
  });

  if (!team) {
    return res.status(400).json({ message: "Invalid invite code" });
  }

  if (team.roster.length >= LADDER_ROSTER_LIMIT) {
    return res.status(400).json({ message: "Team already has 4 members" });
  }

  await prisma.ladderRegisteredTeam.update({
    where: { id: team.id },
    data: { roster: { connect: { id: user.id } } },
  });

  res.status(200).end();
}

export default joinHandler;
