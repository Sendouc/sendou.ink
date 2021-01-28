import { Box, Flex, HStack } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyContainer from "components/common/MyContainer";
import SubText from "components/common/SubText";
import TwitterAvatar from "components/common/TwitterAvatar";
import UserAvatar from "components/common/UserAvatar";
import RegisterHeader from "components/play/RegisterHeader";
import { useLadderTeams } from "hooks/play";
import { getLadderRounds } from "lib/playFunctions";
import { shuffleArray } from "lib/shuffleArray";
import { useMyTheme } from "lib/useMyTheme";
import { GetStaticProps } from "next";
import prisma from "prisma/client";
import { getAllLadderRegisteredTeamsForMatches } from "prisma/queries/getAllLadderRegisteredTeamsForMatches";
import { getLadderDay, GetLadderDayData } from "prisma/queries/getLadderDay";

interface Props {
  ladderDay: GetLadderDayData;
}

const PlayPage: React.FC<Props> = ({ ladderDay }) => {
  const { gray } = useMyTheme();
  const { data } = useLadderTeams(!ladderDay);

  console.log({ ladderDay });

  return (
    <MyContainer>
      <Breadcrumbs pages={[{ name: t`Play` }]} />
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
      {ladderDay && ladderDay.matches.length === 0 && (
        <>
          <RegisterHeader />
          <Box mt={4}>
            {data
              ?.sort((a, b) => b.roster.length - a.roster.length)
              .map((team) => {
                const teamTuple = team.roster
                  .filter((member) => member.team)
                  .map((member) => member.team)
                  .reduce(
                    (
                      acc: [
                        {
                          name: string;
                          twitterName: string;
                          nameForUrl: string;
                        },
                        number
                      ][],
                      cur
                    ) => {
                      const tuple = acc.find(
                        ([{ name }]) => name === cur!.name
                      );
                      if (tuple) tuple[1]++;

                      acc.push([{ ...(cur as any) }, 1]);
                      return acc;
                    },
                    []
                  )
                  .find((tuple) => tuple[1] >= 3);
                return (
                  <Box key={team.id} my={4}>
                    {teamTuple && team.roster.length === 4 ? (
                      <Flex fontWeight="bold" align="center">
                        {teamTuple[0].twitterName && (
                          <TwitterAvatar
                            twitterName={teamTuple[0].twitterName}
                            size="sm"
                            mr={1}
                          />
                        )}
                        {teamTuple[0].name}
                        {teamTuple[1] === 3 && team.roster.length >= 4 && (
                          <SubText ml={1}>+1</SubText>
                        )}
                      </Flex>
                    ) : (
                      <HStack>
                        {team.roster.map((member) => (
                          <UserAvatar key={member.id} user={member} size="sm" />
                        ))}
                      </HStack>
                    )}
                    <Box color={gray} fontSize="sm" mt={2}>
                      {team.roster
                        .map((user) => `${user.username}#${user.discriminator}`)
                        .join(", ")}
                    </Box>
                  </Box>
                );
              })}
          </Box>
        </>
      )}
      {ladderDay && ladderDay.matches.length > 0 && (
        <>{ladderDay.matches.length} matches pending</>
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
    dateWeekFromNow.setHours(168);

    const createPosts = matches.flatMap((round, i) =>
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

    // TODO: is this ok?
    await prisma.$transaction([
      ...createPosts,
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
