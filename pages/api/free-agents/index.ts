import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import freeAgentsService, { PostsData } from "services/freeagents";
import { Serialized } from "utils/types";
import { freeAgentPostSchema } from "utils/validators/fapost";

export type FreeAgentsGet = Serialized<PostsData>;

const GET = async (_req: NextApiRequest, res: NextApiResponse<PostsData>) => {
  const events = await freeAgentsService.posts();
  res.status(200).json(events);
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = freeAgentPostSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await freeAgentsService.upsertPost({ input: parsed.data, userId: user.id });
  res.status(200).end();
};

const DELETE = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  await freeAgentsService.deletePost(user.id);
  res.status(200).end();
};

const freeAgentsHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST, DELETE });

export default freeAgentsHandler;
