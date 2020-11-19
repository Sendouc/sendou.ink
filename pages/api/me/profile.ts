import { getMySession } from "lib/getMySession";
import { profileSchemaBackend } from "lib/validators/profile";
import { NextApiRequest, NextApiResponse } from "next";
import DBClient from "prisma/client";

const prisma = DBClient.getInstance().prisma;

const profileHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === "PUT") {
    const user = await getMySession(req);
    if (!user) return res.status(401).end();

    const body = req.body ?? {};

    const argsForDb = {
      ...body,
      customUrlPath:
        typeof body.customUrlPath === "string"
          ? body.customUrlPath.toLowerCase()
          : body.customUrlPath,
      twitterName:
        typeof body.twitterName === "string"
          ? body.twitterName.toLowerCase()
          : body.twitterName,
      twitchName:
        typeof body.twitchName === "string"
          ? body.twitchName.toLowerCase()
          : body.twitchName,
    };

    try {
      profileSchemaBackend.parse(argsForDb);
    } catch {
      return res.status(400).end();
    }

    if (isDuplicateCustomUrl(argsForDb.customUrlPath, user.id)) {
      return res.status(400).json({ message: "custom url already in use" });
    }

    await prisma.profile.upsert({
      create: {
        user: { connect: { id: user.id } },
        ...argsForDb,
      },
      update: {
        ...argsForDb,
      },
      where: { userId: user.id },
    });

    res.status(200).end();
  } else {
    res.status(405).end();
  }
};

async function isDuplicateCustomUrl(customUrlPath: string, userId: number) {
  if (!customUrlPath) return false;

  const profileWithSameCustomUrl = await prisma.profile.findOne({
    where: {
      customUrlPath,
    },
  });

  if (profileWithSameCustomUrl && profileWithSameCustomUrl.userId !== userId) {
    return false;
  }
}

export default profileHandler;
