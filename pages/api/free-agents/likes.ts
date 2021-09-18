import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import freeAgentsService, { LikesData } from "services/freeagents";
import { Serialized } from "utils/types";
import * as z from "zod";

export type LikesGet = Serialized<LikesData>;

const GET = async (req: NextApiRequest, res: NextApiResponse<LikesData>) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const likes = await freeAgentsService.likes({ user });
  res.status(200).json(likes);
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = z.object({ postId: z.number() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(401).end();
  }

  await freeAgentsService.addLike({
    userId: user.id,
    postId: parsed.data.postId,
  });
  res.status(200).end();
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = z.object({ postId: z.number() }).safeParse(req.body);
  if (!parsed.success) {
    return res.status(401).end();
  }

  await freeAgentsService.deleteLike({
    userId: user.id,
    postId: parsed.data.postId,
  });
  res.status(200).end();
};

const likesHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST, DELETE });

export default likesHandler;
