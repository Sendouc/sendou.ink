import type { ActionFunction } from "remix";
import { z } from "zod";
import { abilities, weapons } from "~/constants";
import { idToStage, modesShort, stages } from "~/core/stages/stages";
import { parseRequestFormData } from "~/utils";
import { v4 as uuidv4 } from "uuid";
import * as LFGMatch from "~/models/LFGMatch.server";
import * as GameDetail from "~/models/GameDetail.server";
import invariant from "tiny-invariant";
import { Ability } from "@prisma/client";

const abilityEnum = z.enum(abilities as [Ability, ...Ability[]]);

const playerSchema = z.object({
  principal_id: z.string(),
  name: z.string().min(1).max(10),
  weapon: z.enum(weapons),
  main_abilities: z.array(abilityEnum).length(3),
  sub_abilities: z.array(abilityEnum).length(9),
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

export const detailedMapSchema = z.object({
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
});

const matchDetailsSchema = z.object({
  token: z.string(),
  data: z.object({
    matchId: z.string().uuid(),
    maps: z.array(detailedMapSchema),
  }),
});

export const action: ActionFunction = async ({ request }) => {
  const input = await parseRequestFormData({
    request,
    schema: matchDetailsSchema,
    useBody: true,
  });

  if (input.token !== process.env.LANISTA_TOKEN) {
    return new Response(null, { status: 401 });
  }

  const match = await LFGMatch.findById(input.data.matchId);
  if (!match) {
    return new Response("Invalid match id", { status: 400 });
  }

  const expectedMapsCount = match.stages.reduce(
    (acc, cur) => Number(Boolean(cur.winnerGroupId)) + acc,
    0
  );
  if (expectedMapsCount !== input.data.maps.length) {
    return new Response(
      `Incorrect amount of maps provided. Expected ${expectedMapsCount} got ${input.data.maps.length}`,
      { status: 400 }
    );
  }

  for (const [i, map] of input.data.maps.entries()) {
    const stageObj = idToStage(match.stages[i].stage.id);
    if (stageObj.name === map.stage && stageObj.mode === map.mode) {
      continue;
    }

    return new Response(
      `In position ${i + 1} expected ${stageObj.mode} ${
        stageObj.name
      } but got ${map.mode} ${map.stage}`,
      { status: 400 }
    );
  }

  const createGameDetailsInput: GameDetail.CreateGameDetailsInput[] = [];

  for (const [i, map] of input.data.maps.entries()) {
    const lfgStage = match.stages[i];
    invariant(lfgStage, "Unexpected lfgStage undefined");

    createGameDetailsInput.push({
      id: uuidv4(),
      duration: map.duration,
      lfgStageId: lfgStage.id,
      startedAt: new Date(map.date),
      teams: [map.winners, map.losers].map((team, i) => {
        return {
          id: uuidv4(),
          isWinner: i === 0,
          score: team.score,
          players: team.players.map((player) => ({
            principalId: player.principal_id,
            name: player.name,
            weapon: player.weapon,
            mainAbilities: player.main_abilities,
            subAbilities: player.sub_abilities,
            kills: player.kills,
            assists: player.assists,
            deaths: player.deaths,
            specials: player.specials,
            paint: player.paint,
            gear: player.gear,
          })),
        };
      }),
    });
  }

  await GameDetail.create(createGameDetailsInput);

  return new Response(null, { status: 204 });
};
