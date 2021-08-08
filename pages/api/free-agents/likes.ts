import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import freeAgentsService, { LikesData } from "services/freeagents";
import { Serialized } from "utils/types";

export type LikesGet = Serialized<LikesData>;

const GET = async (req: NextApiRequest, res: NextApiResponse<LikesData>) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const likes = await freeAgentsService.likes({ user });
  res.status(200).json(likes);
};

const likesHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET });

export default likesHandler;
