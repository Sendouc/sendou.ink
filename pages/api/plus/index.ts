import { NextApiRequest, NextApiResponse } from "next";
import { createHandler } from "utils/api";
import plusService, { PlusStatuses } from "services/plus";
import { Serialized } from "utils/types";

export type PlusStatusesGet = Serialized<PlusStatuses>;

const GET = async (
  _req: NextApiRequest,
  res: NextApiResponse<PlusStatuses>
) => {
  const statuses = await plusService.getPlusStatuses();
  res.status(200).json(statuses);
};

const plushandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET });

export default plushandler;
