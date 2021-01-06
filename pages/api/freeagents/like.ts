import { getMySession } from "lib/getMySession";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  return res.status(200).json({ message: "not implemented" });

  switch (req.method) {
    case "PUT":
      await putHandler(req, res);
      break;
    case "DELETE":
      await deleteHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();

  if (typeof req.body.likedId !== "number") {
    return res.status(400).end();
  }

  await prisma.freeAgentPost.update({
    where: { userId: user.id },
    data: { likedPosts: { connect: { id: req.body.likedId } } },
  });
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();

  res.status(200).end();
}

export default handler;
