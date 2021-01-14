import { getMySession } from "lib/getMySession";
import { makeNameUrlFriendly } from "lib/makeNameUrlFriendly";
import { teamSchema } from "lib/validators/team";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { v4 as uuidv4 } from "uuid";

const teamsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      await postHandler(req, res);
      break;
    case "DELETE":
      await deleteHandler(req, res);
      break;
    case "PUT":
      await putHandler(req, res);
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
    select: { teamId: true },
  });

  if (userFromDb?.teamId) return res.status(400).end();

  const teamName = req.body.name;

  if (typeof teamName !== "string") {
    return res.status(400).end();
  }

  const normalizedTeamName = teamName.trim().replace(/\s\s+/g, " ");

  if (
    normalizedTeamName.length < 2 ||
    normalizedTeamName.length > 32 ||
    /[^a-z0-9 ]/i.test(normalizedTeamName) ||
    normalizedTeamName === "join"
  ) {
    return res.status(400).end();
  }

  const nameForUrl = makeNameUrlFriendly(teamName);

  const existingTeam = await prisma.team.findUnique({ where: { nameForUrl } });
  if (existingTeam) {
    return res.status(400).end();
  }

  await prisma.team.create({
    data: {
      name: normalizedTeamName,
      nameForUrl,
      captain: { connect: { id: user.id } },
      roster: { connect: { id: user.id } },
      inviteCode: uuidv4(),
    },
  });

  res.status(200).end();
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const team = await prisma.team.findUnique({ where: { captainId: user.id } });
  if (!team) return res.status(400).end();

  await prisma.team.delete({ where: { id: team.id } });

  res.status(200).end();
}

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  const parsed = teamSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).end();
  }

  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const team = await prisma.team.findUnique({ where: { captainId: user.id } });
  if (!team) return res.status(400).end();

  await prisma.team.update({ where: { id: team.id }, data: parsed.data });

  res.status(200).end();
}

export default teamsHandler;
