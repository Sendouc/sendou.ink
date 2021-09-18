import { NextApiRequest, NextApiResponse } from "next";
import plusService from "services/plus";
import { createHandler, getMySession } from "utils/api";
import { vouchSchema } from "utils/validators/vouch";

const POST = async (req: NextApiRequest, res: NextApiResponse) => {
  const user = await getMySession(req);
  if (!user) {
    return res.status(401).end();
  }

  const parsed = vouchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json(parsed.error);
  }

  await plusService.addVouch({
    input: parsed.data,
    userId: user.id,
  });

  res.status(200).end();
};

const vouchesHandler = (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { POST });

export default vouchesHandler;
