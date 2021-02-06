import { detailedMapSchema } from "lib/validators/detailedMap";
import { NextApiRequest, NextApiResponse } from "next";
import prisma from "prisma/client";
import { rate, Rating } from "ts-trueskill";
import * as z from "zod";

const matchesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "GET":
      await getHandler(req, res);
      break;
    case "POST":
      await postHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function getHandler(req: NextApiRequest, res: NextApiResponse) {
  const { discordId } = req.body;

  if (typeof discordId !== "string") return res.status(400).end();

  // TODO: make sure this works
  const maplists = (
    await prisma.user.findUnique({
      where: { discordId },
      select: {
        ladderMatches: {
          where: { match: { teamAScore: null } },
          select: {
            team: true,
            match: { select: { maplist: true, order: true, id: true } },
          },
        },
      },
    })
  )?.ladderMatches
    .sort((a, b) => a.match.order - b.match.order)
    .map(({ match, team }) => ({
      maplist: match.maplist,
      id: match.id,
      submitterSide: team,
    }));

  res.status(200).json(maplists ?? []);
}

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const { token, matchId, detailedMap, teamAScore, teamBScore } = req.body;

  if (token !== process.env.LANISTA_TOKEN) {
    return res.status(401).end();
  }

  try {
    const parsed = detailedMapSchema.parse(detailedMap);

    if (
      (teamAScore !== 5 && teamBScore !== 5) ||
      teamAScore === teamBScore ||
      teamAScore > 5 ||
      teamBScore > 5
    ) {
      throw Error(
        `Invalid scores: teamAScore: ${teamAScore}, teamBScore: ${teamBScore}`
      );
    }

    const updateLadderMatch = prisma.ladderMatch.update({
      where: { id: matchId },
      data: {
        teamAScore,
        teamBScore,
        details: {
          create: parsed.map((detailedMap, i) => {
            return {
              duration: detailedMap.duration,
              loserScore: detailedMap.losers.score,
              mode: detailedMap.mode,
              order: i + 1,
              stage: detailedMap.stage,
              winnerScore: detailedMap.winners.score,
              players: {
                create: [
                  detailedMap.winners.players,
                  detailedMap.losers.players,
                ].flatMap((players, i) =>
                  players.map((player) => ({
                    status: i === 0 ? "WINNER" : "LOSER",
                    principalId: player.principal_id,
                    name: player.name,
                    weapon: player.weapon,
                    mainAbilities: player.main_abilities,
                    subAbilities: player.sub_abilities.flat(),
                    kills: player.kills,
                    assists: player.assists,
                    deaths: player.deaths,
                    specials: player.specials,
                    paint: player.paint,
                    gear: player.gear,
                  }))
                ),
              },
            };
          }),
        },
      },
    });

    const ladderMatch = await prisma.ladderMatch.findUnique({
      where: { id: matchId },
      select: {
        teamAScore: true,
        players: {
          select: {
            user: { select: { trueSkill: true, id: true } },
            team: true,
          },
        },
      },
    });

    if (!ladderMatch) {
      throw Error("match with the id provided doesn't exist");
    }

    if (ladderMatch.teamAScore) {
      throw Error("match already reported");
    }

    const winningSide = teamAScore > teamBScore ? "ALPHA" : "BRAVO";

    const winningTeam = ladderMatch?.players
      .filter((player) => player.team === winningSide)
      .map(({ user }) => ({
        id: user.id,
        rating: user.trueSkill
          ? new Rating(user.trueSkill.mu, user.trueSkill.sigma)
          : new Rating(),
      }));
    const losingTeam = ladderMatch?.players
      .filter((player) => player.team !== winningSide)
      .map(({ user }) => ({
        id: user.id,
        rating: user.trueSkill
          ? new Rating(user.trueSkill.mu, user.trueSkill.sigma)
          : new Rating(),
      }));

    const [ratedWinners, ratedLosers] = rate(
      winningTeam.map((user) => user.rating),
      losingTeam.map((user) => user.rating)
    );

    const updateWinners = ratedWinners.map(({ mu, sigma }, i) =>
      prisma.ladderPlayerTrueSkill.upsert({
        where: { userId: winningTeam[i].id },
        create: { mu, sigma, userId: winningTeam[i].id },
        update: { mu, sigma },
      })
    );
    const updateLosers = ratedLosers.map(({ mu, sigma }, i) =>
      prisma.ladderPlayerTrueSkill.upsert({
        where: { userId: losingTeam[i].id },
        create: { mu, sigma, userId: losingTeam[i].id },
        update: { mu, sigma },
      })
    );

    // await prisma.$transaction([updateLadderMatch, ...updateWinners, ...updateLosers] as any);
    res.status(200).end();
  } catch (e) {
    if (e instanceof z.ZodError) {
      return res.status(400).json(JSON.stringify(e.errors, null, 2));
    }
    res.status(400).json({ message: e.message });
  }
}

export default matchesHandler;
