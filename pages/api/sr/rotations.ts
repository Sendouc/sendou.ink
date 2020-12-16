import { NextApiRequest, NextApiResponse } from "next";
import { getAllSalmonRunRotations } from "prisma/queries/getAllSalmonRunRotations";

const rotationsHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== "GET") {
    return res.status(405).end();
  }

  res.status(200).json(await getAllSalmonRunRotations());
};

export default rotationsHandler;
