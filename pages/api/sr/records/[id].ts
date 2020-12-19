import { SALMON_RUN_ADMIN_DISCORD_IDS } from "lib/constants";
import { getMySession } from "lib/getMySession";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const salmonRunRecordIdHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const user = await getMySession(req);
  if (!user || !SALMON_RUN_ADMIN_DISCORD_IDS.includes(user.discordId))
    return res.status(401).end();

  if (typeof req.query.id !== "string") return res.status(400).end();
  const id = parseInt(req.query.id);
  if (Number.isNaN(id)) return res.status(400).end();

  switch (req.method) {
    case "PATCH":
      await patchHandler();
      break;
    case "DELETE":
      await deleteHandler();
      break;
    default:
      return res.status(405).end();
  }

  res.status(200).end();

  async function patchHandler() {
    await prisma.salmonRunRecord.update({
      where: { id },
      data: { approved: true },
    });
  }

  async function deleteHandler() {
    await prisma.salmonRunRecord.delete({ where: { id } });
  }
};

export default salmonRunRecordIdHandler;
