import { getMySession } from "lib/api";
import { NextApiRequest, NextApiResponse } from "next";
import plusService from "services/plus";

const plusHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);

  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    default:
      res.status(405).end();
  }

  async function getHandler(_req: NextApiRequest, res: NextApiResponse) {
    if (!user) return res.status(401).end();

    try {
      res.status(200).json(await plusService.getPlusStatus(user.id));
    } catch (e) {
      console.error(e.message);
      res.status(500).end();
    }
  }
};

export default plusHandler;
