import { getMySession } from "lib/getMySession";
import { getLadderRounds } from "lib/playFunctions";
import { shuffleArray } from "lib/shuffleArray";
import { NextApiRequest, NextApiResponse } from "next";
import { getAllLadderRegisteredTeamsForMatches } from "prisma/queries/getAllLadderRegisteredTeamsForMatches";

const matchesHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  switch (req.method) {
    case "POST":
      await postHandler(req, res);
      break;
    default:
      res.status(405).end();
  }
};

async function postHandler(req: NextApiRequest, res: NextApiResponse) {
  const user = await getMySession();

  // if (user?.discordId !== ADMIN_DISCORD_ID) {
  //   return res.status(401).end();
  // }

  const teams = (await getAllLadderRegisteredTeamsForMatches()).filter(
    (team) => team.roster.length === 4
  );

  if (teams.length < 4) return res.status(400).end();

  const matches = getLadderRounds(teams);

  // await Promise.all(
  //   matches.flatMap((round, i) =>
  //     round.map((match) =>
  //       prisma.ladderMatch.create({
  //         data: {
  //           date: "",
  //           maplist: {},
  //           order: i + 1,
  //           players: {
  //             create: match.flatMap((team, teamI) =>
  //               team.roster.map((user) => ({
  //                 userId: user.id,
  //                 team: teamI === 0 ? "ALPHA" : "BRAVO",
  //               }))
  //             ),
  //           },
  //         },
  //       })
  //     )
  //   )
  // );

  const eighteenMaps = getMaplist();

  res.status(200).json(
    matches.flatMap((round, i) =>
      round.map((match) => ({
        data: {
          date: "",
          maplist:
            i === 0 ? eighteenMaps.slice(0, 9) : eighteenMaps.slice(9, 18),
          order: i + 1,
          players: {
            create: match.flatMap((team, teamI) =>
              team.roster.map((user) => ({
                userId: user.id,
                team: teamI === 0 ? "ALPHA" : "BRAVO",
              }))
            ),
          },
        },
      }))
    )
  );
}

function getMaplist() {
  const modes = shuffleArray(["SZ", "TC", "RM", "CB"]);
  const stages = shuffleArray([
    "The Reef",
    "Musselforge Fitness",
    "Starfish Mainstage",
    "Humpback Pump Track",
    "Inkblot Art Academy",
    "Sturgeon Shipyard",
    "Manta Maria",
    "Snapper Canal",
    "Blackbelly Skatepark",
    "MakoMart",
    "Shellendorf Institute",
    "Goby Arena",
    "Piranha Pit",
    "Camp Triggerfish",
    "Wahoo World",
    "New Albacore Hotel",
    "Ancho-V Games",
    "Skipper Pavilion",
    //"Moray Towers",
    //"Port Mackerel",
    //"Walleye Warehouse",
    //"Arowana Mall",
    //"Kelp Dome"
  ]);

  return stages.map((stage) => {
    const mode = modes.pop();
    modes.unshift(mode!);
    return { stage, mode };
  });
}

export default matchesHandler;
