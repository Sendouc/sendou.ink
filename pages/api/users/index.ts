import { NextApiRequest, NextApiResponse } from "next";
import { getAllUsersLean } from "prisma/queries/getAllUsersLean";

const usersHandler = async (_req: NextApiRequest, res: NextApiResponse) => {
  const users = await getAllUsersLean();
  res.status(200).json(users);
};

export default usersHandler;
