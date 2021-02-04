import { Box, Center, Flex, Grid, Heading } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import ModeImage from "components/common/ModeImage";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import LadderTeam from "components/play/LadderTeam";
import MatchUp from "components/play/MatchUp";
import RegisterHeader from "components/play/RegisterHeader";
import { useMyTheme } from "hooks/common";
import { useLadderTeams } from "hooks/play";
import { getLadderRounds } from "lib/playFunctions";
import { shuffleArray } from "lib/shuffleArray";
import { GetStaticProps } from "next";
import prisma from "prisma/client";
import { getAllLadderRegisteredTeamsForMatches } from "prisma/queries/getAllLadderRegisteredTeamsForMatches";
import { getLadderDay, GetLadderDayData } from "prisma/queries/getLadderDay";
import { Fragment } from "react";

interface Props {
  ladderDay: GetLadderDayData;
}

const PlayPage: React.FC<Props> = ({ ladderDay }) => {
  const { gray } = useMyTheme();
  const { data } = useLadderTeams(!ladderDay);

  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Play` }]} />
      {!ladderDay?.matches.length && (
        <Box fontSize="lg" fontWeight="bold">
          {ladderDay ? (
            <>Next event: {new Date(ladderDay.date).toLocaleString()}</>
          ) : (
            <>
              <Trans>
                Next ladder date is not confirmed. Follow this page for updates!
              </Trans>
            </>
          )}
        </Box>
      )}
      {ladderDay && ladderDay.matches.length === 0 && (
        <>
          <RegisterHeader />
          <Box mt={4}>
            {data
              ?.sort((a, b) => b.roster.length - a.roster.length)
              .map((team) => (
                <LadderTeam key={team.id} roster={team.roster} my={2} />
              ))}
          </Box>
        </>
      )}
      {ladderDay && ladderDay.matches.length > 0 && (
        <>
          {[1, 2].map((round) => (
            <Fragment key={round}>
              <Heading size="md" fontFamily="'Rubik', sans-serif">
                Round {round}
              </Heading>
              <SubText mt={4}>Maplist</SubText>
              {(ladderDay.matches.find((match) => match.order === round)!
                .maplist as any[]).map(({ stage, mode }, i) => {
                return (
                  <Flex
                    key={stage + mode}
                    align="center"
                    color={gray}
                    fontSize="sm"
                    my={2}
                  >
                    {i + 1}){" "}
                    <Center mx={1}>
                      <ModeImage mode={mode} size={24} />
                    </Center>{" "}
                    {stage}
                  </Flex>
                );
              })}
              <Grid
                templateColumns="3fr 1fr 3fr"
                placeItems="center"
                rowGap={4}
                mt={8}
                mb={8}
              >
                {ladderDay.matches
                  .filter((match) => match.order === round)
                  .map((match) => (
                    <MatchUp
                      key={match.players[0].user.discordId}
                      matchUp={match}
                    />
                  ))}
              </Grid>
            </Fragment>
          ))}
        </>
      )}
    </MyContainer>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const ladderDay = await getLadderDay();

  let ladderDayAfterGeneration: GetLadderDayData | undefined;
  if (
    ladderDay &&
    !ladderDay.matches.length &&
    ladderDay.date.getTime() < new Date().getTime()
  ) {
    const teams = (await getAllLadderRegisteredTeamsForMatches()).filter(
      (team) => team.roster.length === 4
    );

    if (teams.length < 4) {
      return {
        props: { ladderDay: JSON.parse(JSON.stringify(ladderDay)) },
        revalidate: 30,
      }; // FIX
    }

    const matches = getLadderRounds(teams);

    const eighteenMaps = getMaplist();

    const dateWeekFromNow = new Date(ladderDay.date);
    dateWeekFromNow.setHours(
      ladderDay.date.getFullYear(),
      ladderDay.date.getMonth(),
      ladderDay.date.getDate() + 7
    );

    const createMatches = matches.flatMap((round, i) =>
      round.map((match) =>
        prisma.ladderMatch.create({
          data: {
            dayId: ladderDay.id,
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
        })
      )
    );
    const createLadderDay = prisma.ladderDay.create({
      data: { date: dateWeekFromNow },
    });
    const deleteLadderRegisteredTeams = prisma.ladderRegisteredTeam.deleteMany();

    await prisma.$transaction([
      ...createMatches,
      createLadderDay,
      deleteLadderRegisteredTeams,
    ] as any);

    ladderDayAfterGeneration = await getLadderDay();
  }

  return {
    props: {
      ladderDay: JSON.parse(
        JSON.stringify(ladderDayAfterGeneration ?? ladderDay)
      ),
    },
    revalidate: 30,
  };
};

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

export default PlayPage;
