import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import plusService, { VotedUserScores } from "services/plus";
import { Serialized } from "utils/types";
import { voteSchema, votesSchema } from "utils/validators/votes";

export type VotesGet = Serialized<VotedUserScores>;

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse<VotedUserScores>
) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const votedUserScores = await plusService.votedUserScores(user.id);

  res.status(200).json(votedUserScores);
};

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = votesSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  const votedUserScores = await plusService.addVotes({
    input: parsed.data,
    userId: user.id,
  });

  res.status(200).json(votedUserScores);
};

const PATCH = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = voteSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await plusService.editVote({ input: parsed.data, userId: user.id });

  res.status(200).end();
};

const votesHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST, PATCH });

export default votesHandler;
