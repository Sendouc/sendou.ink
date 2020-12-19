import { ADMIN_DISCORD_ID, SALMON_RUN_ADMIN_DISCORD_IDS } from "lib/constants";
import { getMySession } from "lib/getMySession";
import { salmonRunRecordSchema } from "lib/validators/salmonRunRecord";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getAllSalmonRunRecords } from "prisma/queries/getAllSalmonRunRecords";

const getHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);

  const records = await getAllSalmonRunRecords(user?.id);

  res.status(200).json(records);
};

const postHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();
  if (
    !SALMON_RUN_ADMIN_DISCORD_IDS.includes(user.discordId) &&
    user.discordId !== ADMIN_DISCORD_ID
  ) {
    return res.status(401).end();
  }

  const parsed = salmonRunRecordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).end();
  }

  await prisma.salmonRunRecord.create({
    data: {
      goldenEggCount: parsed.data.goldenEggCount,
      category: parsed.data.category,
      links: parsed.data.links.trim().split("\n"),
      approved: false,
      // approved: SALMON_RUN_ADMIN_DISCORD_IDS.includes(user.discordId) || user.discordId === ADMIN_DISCORD_ID
      submitter: {
        connect: { id: user.id },
      },
      rotation: {
        connect: { id: parsed.data.rotationId },
      },
      roster: {
        connect: [{ id: user.id }].concat(
          parsed.data.userIds.map((id) => ({ id }))
        ),
      },
    },
  });

  res.status(200).end();
};

const salmonRunRecordsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    case "POST":
      await postHandler(req, res);
      break;
  }
};

export default salmonRunRecordsHandler;
