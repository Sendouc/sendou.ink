import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { getMySession } from "utils/api";

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
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

export type FreeAgentLikeInfo = {
  likedPostIds: number[];
  matchedPostIds: number[];
};

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();

  const post = await prisma.freeAgentPost.findUnique({
    where: { userId: user.id },
    include: {
      likedPosts: { select: { id: true } },
      likersPosts: { select: { id: true, updatedAt: true } },
    },
  });

  const dateMonthAgo = new Date();
  dateMonthAgo.setMonth(dateMonthAgo.getMonth() - 1);

  if (!post || post.updatedAt.getTime() < dateMonthAgo.getTime()) {
    return res.status(400).end();
  }

  const likerPostIds = new Set(
    post.likersPosts
      .filter((post) => post.updatedAt.getTime() >= dateMonthAgo.getTime())
      .map((post) => post.id)
  );

  res.status(200).json({
    likedPostIds: post.likedPosts.map((post) => post.id),
    matchedPostIds: post.likedPosts
      .filter((post) => likerPostIds.has(post.id))
      .map((post) => post.id),
  });
}

async function putHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();

  if (typeof req.body.postId !== "number") {
    return res.status(400).end();
  }

  await prisma.freeAgentPost.update({
    where: { userId: user.id },
    data: { likedPosts: { connect: { id: req.body.postId } } },
  });

  res.status(200).end();
}

async function deleteHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession(req);

  if (!user) return res.status(401).end();

  if (typeof req.body.postId !== "number") {
    return res.status(400).end();
  }

  await prisma.freeAgentPost.update({
    where: { userId: user.id },
    data: { likedPosts: { disconnect: { id: req.body.postId } } },
  });

  res.status(200).end();
}

export default handler;
