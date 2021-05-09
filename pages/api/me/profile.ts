import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";
import { profileSchemaBackend } from "utils/validators/profile";

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

    const parsed = profileSchemaBackend.safeParse(argsForDb);

    if (!parsed.success) {
      return res.status(400).end();
    }

    if (await isDuplicateCustomUrl(argsForDb.customUrlPath, user.id)) {
      return res.status(400).json({ message: "Custom URL already in use" });
    }

    await prisma.profile.upsert({
      create: {
        user: { connect: { id: user.id } },
        ...parsed.data,
        customUrlPath: parsed.data.customUrlPath?.trim(),
      },
      update: {
        ...parsed.data,
        customUrlPath: parsed.data.customUrlPath?.trim(),
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

  const profileWithSameCustomUrl = await prisma.profile.findUnique({
    where: {
      customUrlPath,
    },
  });

  if (!profileWithSameCustomUrl || profileWithSameCustomUrl.userId === userId) {
    return false;
  }

  return true;
}

export default profileHandler;
