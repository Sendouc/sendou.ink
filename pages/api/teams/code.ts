import { getMySession } from "lib/getMySession";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { v4 as uuidv4 } from "uuid";

const codeHandler = async (req: NextApiRequest, res: NextApiResponse) => {
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

  const team = await prisma.team.findUnique({
    where: { captainId: user.id },
  });

  if (!team) {
    return res.status(400).end();
  }

  await prisma.team.update({
    where: { id: team.id },
    data: { inviteCode: uuidv4() },
  });

  res.status(200).end();
}

export default codeHandler;
