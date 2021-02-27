import { getMySession } from "lib/api";
import { NextApiRequest, NextApiResponse } from "next";
import plusService from "services/plus";

const plusHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    default:
      res.status(405).end();
  }

  async function getHandler(_req: NextApiRequest, res: NextApiResponse) {
    try {
      res.status(200).json(await plusService.getPlusStatuses());
    } catch (e) {
      console.error(e.message);
      res.status(500).end();
    }
  }
};

export default plusHandler;
