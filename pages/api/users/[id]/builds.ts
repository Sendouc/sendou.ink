import { NextApiRequest, NextApiResponse } from "next";
import {
  getBuildsByUser,
  GetBuildsByUserData,
} from "prisma/queries/getBuildsByUser";

const usersBuildsHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetBuildsByUserData>
) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  const builds = await getBuildsByUser(Number(req.query.id));

  res.status(200).json(builds);
};

export default usersBuildsHandler;
