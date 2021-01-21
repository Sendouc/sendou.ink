import { NextApiRequest, NextApiResponse } from "next";
import {
  getUserByIdentifier,
  GetUserByIdentifierData,
} from "prisma/queries/getUserByIdentifier";

const userHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetUserByIdentifierData>
) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  try {
    const user = await getUserByIdentifier(req.query.id as string);
    res.status(200).json(user!);
  } catch {
    res.status(404).end();
  }
};

export default userHandler;
