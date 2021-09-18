import { NextApiRequest, NextApiResponse } from "next";
import { createHandler, getMySession } from "utils/api";
import plusService, { GetUsersForVoting } from "services/plus";
import { Serialized } from "utils/types";

export type UsersForVotingGet = Serialized<GetUsersForVoting>;

const GET = async (
  req: NextApiRequest,
  res: NextApiResponse<GetUsersForVoting>
) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const usersForVoting = await plusService.getUsersForVoting(user.id);
  res.status(200).json(usersForVoting);
};

const usersForVotingHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET });

export default usersForVotingHandler;
