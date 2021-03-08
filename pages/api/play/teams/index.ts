import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getAllLadderRegisteredTeams } from "prisma/queries/getAllLadderRegisteredTeams";
import { getMySession } from "utils/api";
import { v4 as uuidv4 } from "uuid";

const teamsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    case "POST":
      await postHandler(req, res);
      break;
    case "DELETE":
      await deleteHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  const teams = await getAllLadderRegisteredTeams();

  res.status(200).json(
    teams.map((team) => ({
      ...team,
      inviteCode: team.ownerId === user?.id ? team.inviteCode : undefined,
    }))
  );
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const userFromDb = await prisma.user.findUnique({
    where: { id: user.id },
    select: { ladderTeamId: true },
  });

  if (!userFromDb || userFromDb.ladderTeamId) {
    return res.status(400).end();
  }

  await prisma.ladderRegisteredTeam.create({
    data: {
      inviteCode: uuidv4(),
      ownerId: user.id,
      roster: { connect: { id: user.id } },
    },
  });

  res.status(200).end();
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const team = await prisma.ladderRegisteredTeam.findUnique({
    where: { ownerId: user.id },
  });
  if (!team) return res.status(400).end();

  await prisma.ladderRegisteredTeam.delete({ where: { id: team.id } });

  res.status(200).end();
}

export default teamsHandler;
