import {
  Center,
  Flex,
  Grid,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import ModeImage from "components/common/ModeImage";
import SubText from "components/common/SubText";
import MatchUp from "components/play/MatchUp";
import RegisterTab from "components/play/RegisterTab";
import { useMyTheme } from "hooks/common";
import { useLadderTeams } from "hooks/play";
import { GetStaticProps } from "next";
import prisma from "prisma/client";
import { getAllLadderRegisteredTeamsForMatches } from "prisma/queries/getAllLadderRegisteredTeamsForMatches";
import { Fragment } from "react";
import playService, { NextLadderDay, PreviousLadderDay } from "services/play";
import { shuffleArray } from "utils/arrays";
import { getLadderRounds } from "utils/play";

interface Props {
  ladderDay: NextLadderDay;
  previousLadderDay: PreviousLadderDay;
}

const PlayPage: React.FC<Props> = ({ ladderDay, previousLadderDay }) => {
  const { gray } = useMyTheme();
  const { data } = useLadderTeams(!ladderDay);

  console.log({ previousLadderDay });

  return (
    <>
      <Tabs>
        <TabList mb="1em">
          <Tab>Register</Tab>
          <Tab>Active Matches</Tab>
          <Tab>Match History</Tab>
          <Tab disabled>Leaderboards</Tab>
          <Tab>FAQ</Tab>
        </TabList>
        <TabPanels>
          <TabPanel p={1}>
            <RegisterTab />
          </TabPanel>
          <TabPanel p={1}>
            <p>two!</p>
          </TabPanel>
          <TabPanel p={1}>
            <p>three!</p>
          </TabPanel>
          <TabPanel p={1}>
            <p>four!</p>
          </TabPanel>
          <TabPanel p={1}>
            <p>five!</p>
          </TabPanel>
        </TabPanels>
      </Tabs>
      {previousLadderDay && previousLadderDay.matches.length > 0 && (
        <>
          {[1].map((round) => (
            <Fragment key={round}>
              <Heading size="md">Round {round}</Heading>
              <SubText mt={4}>Maplist</SubText>
              {(previousLadderDay.matches.find(
                (match) => match.order === round
              )!.maplist as any[]).map(({ stage, mode }, i) => {
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
                {previousLadderDay.matches
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
    </>
  );
};

export const getStaticProps: GetStaticProps<Props> = async () => {
  const [ladderDay, previousLadderDay] = await Promise.all([
    playService.nextLadderDay(),
    playService.previousLadderDay(),
  ]);

  let ladderDayAfterGeneration: NextLadderDay | undefined;
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
        props: {
          ladderDay: JSON.parse(JSON.stringify(ladderDay)),
          previousLadderDay,
        },
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

    ladderDayAfterGeneration = await playService.nextLadderDay();
  }

  return {
    props: {
      ladderDay: JSON.parse(
        JSON.stringify(ladderDayAfterGeneration ?? ladderDay)
      ),
      previousLadderDay,
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
