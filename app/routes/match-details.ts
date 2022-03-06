import type { ActionFunction } from "remix";
import { z } from "zod";
import { weapons } from "~/constants";
import { modesShort, stages } from "~/core/stages/stages";
import { parseRequestFormData } from "~/utils";

export const abilityEnum = z.enum([
  "ISM",
  "ISS",
  "REC",
  "RSU",
  "SSU",
  "SCU",
  "SS",
  "SPU",
  "QR",
  "QSJ",
  "BRU",
  "RES",
  "BDU",
  "MPU",
  "OG",
  "LDE",
  "T",
  "CB",
  "NS",
  "H",
  "TI",
  "RP",
  "AD",
  "SJ",
  "OS",
  "DR",
]);

const playerSchema = z.object({
  principal_id: z.string(),
  name: z.string().min(1).max(10),
  weapon: z.enum(weapons),
  main_abilities: z.array(abilityEnum),
  sub_abilities: z.array(z.array(abilityEnum)),
  kills: z.number().int().min(0).max(50),
  assists: z.number().int().min(0).max(50),
  deaths: z.number().int().min(0).max(50),
  specials: z.number().int().min(0).max(50),
  paint: z.number().int().min(0).max(10000),
  gear: z.array(z.string()),
});

const teamInfoSchema = z.object({
  score: z.number().int().min(0).max(100),
  players: z.array(playerSchema),
});

export const detailedMapSchema = z.array(
  z.object({
    stage: z.enum(stages),
    mode: z.enum(modesShort as [string, ...string[]]),
    duration: z.number().int().min(15).max(500),
    winners: teamInfoSchema,
    losers: teamInfoSchema,
    date: z.string().refine((val) => {
      const d = new Date(Number(val));
      if (Number.isNaN(d.getTime())) {
        return false;
      }

      const nd = new Date();
      nd.setMonth(-6);

      if (d.getTime() < nd.getTime()) {
        return false;
      }

      return true;
    }),
  })
);

const matchDetailsSchema = z.object({
  token: z.string(),
  data: z.object({
    matchId: z.string().uuid(),
    maps: z.array(detailedMapSchema),
  }),
});

export const action: ActionFunction = async ({ request }) => {
  const data = await parseRequestFormData({
    request,
    schema: matchDetailsSchema,
    useBody: true,
  });

  if (data.token !== process.env.LANISTA_TOKEN) {
    return new Response(null, { status: 401 });
  }

  return new Response(null, { status: 204 });
};
