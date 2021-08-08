import { NextApiRequest, NextApiResponse } from "next";
import { createHandler } from "utils/api";
import freeAgentsService, { PostsData } from "services/freeagents";
import { Serialized } from "utils/types";

export type FreeAgentsGet = Serialized<PostsData>;

const GET = async (_req: NextApiRequest, res: NextApiResponse<PostsData>) => {
  const events = await freeAgentsService.posts();
  res.status(200).json(events);
};

const freeAgentsHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET });

export default freeAgentsHandler;
