import { NextApiRequest, NextApiResponse } from "next";
import { createHandler } from "utils/api";
import * as z from "zod";
import leagueService from "services/league";

async function GET(req: NextApiRequest, res: NextApiResponse) {
  const parsed = z
    .object({
      region: z.enum(["EU", "NA", "JP"]),
      type: z.enum(["TWIN", "QUAD"]),
    })
    .safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).send(parsed.error.message);
  }

  const latestTime = await leagueService.latestResult(parsed.data);
  if (!latestTime) return res.status(500).send("Unexpected no latest time");

  res.status(200).json({ latestTime });
}

async function POST(req: NextApiRequest, res: NextApiResponse) {
  if (
    !req.body ||
    typeof req.body !== "object" ||
    req.body.token !== process.env.LANISTA_TOKEN
  ) {
    return res.status(401).end();
  }
  const parsed = z
    .array(
      z.object({
        start_time: z.number(),
        league_type: z.object({ key: z.enum(["pair", "team"]) }),
        league_ranking_region: z.object({ code: z.enum(["US", "EU", "JP"]) }),
        rankings: z.array(
          z.object({
            cheater: z.boolean(),
            point: z.number(),
            tag_members: z.array(
              z.object({
                unique_id: z.string(),
                principal_id: z.string(),
                weapon: z.tuple([z.string(), z.string()]),
              })
            ),
          })
        ),
      })
    )
    .safeParse(req.body.data);

  if (!parsed.success) {
    return res.status(400).send(parsed.error.message);
  }

  try {
    await leagueService.createResults(parsed.data);
  } catch (e) {
    return res.status(500).send(e.message);
  }

  res.status(200);
}

export default (req: NextApiRequest, res: NextApiResponse) =>
  createHandler(req, res, { GET, POST });
