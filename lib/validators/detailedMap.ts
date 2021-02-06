import { weapons } from "lib/lists/weapons";
import * as z from "zod";
import { abilityEnum } from "./common";

const playerSchema = z.object({
  principal_id: z.string(),
  name: z.string().min(1).max(10),
  weapon: z.string().refine((val) => weapons.includes(val as any)),
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
    stage: z.string(),
    mode: z.enum(["SZ", "TC", "RM", "CB"]),
    duration: z.number().int().min(15).max(500),
    winners: teamInfoSchema,
    losers: teamInfoSchema,
    date: z.string().refine((val) => {
      const d = new Date(val);
      const timestamp = d.getTime();
      if (Number.isNaN(timestamp)) {
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
