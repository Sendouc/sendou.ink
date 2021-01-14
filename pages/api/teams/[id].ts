import { NextApiRequest, NextApiResponse } from "next";
import { getTeam, GetTeamData } from "prisma/queries/getTeam";

const teamByIdHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<GetTeamData>
) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function getHandler(
  req: NextApiRequest,
  res: NextApiResponse<GetTeamData>
) {
  if (typeof req.query.id !== "string") return res.status(400).end();
  const id = parseInt(req.query.id);

  if (Number.isNaN(id)) return res.status(400).end();

  const team = await getTeam({ id });
  if (!team) return res.status(400).end();

  res.status(200).json(team);
}

export default teamByIdHandler;
