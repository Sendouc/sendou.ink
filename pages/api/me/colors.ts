import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { createHandler, getMySession } from "utils/api";

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);
  if (!user) return res.status(401).end();

  const { colors } = req.body;
  const hexCodeRegex = new RegExp(
    /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3}|[A-Fa-f0-9]{8})$/
  );

  if (typeof colors !== "object" || colors === null) {
    return res.status(400).json({ message: "invalid type for colors" });
  }

  for (const [_key, value] of Object.entries(colors)) {
    if (!hexCodeRegex.test(value as string)) {
      return res.status(400).json({ message: `invalid hex code: ${value}` });
    }
  }

  await prisma.profile.update({ where: { userId: user.id }, data: { colors } });

  res.status(200).end();
}

const colorsHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { POST });

export default colorsHandler;
