import { Box, Center, Flex, Grid, Heading } from "@chakra-ui/layout";
import ModeImage from "components/common/ModeImage";
import MyError from "components/common/MyError";
import MySpinner from "components/common/MySpinner";
import SubText from "components/common/SubText";
import { useMyTheme } from "hooks/common";
import { Fragment } from "react";
import { hoursToMilliseconds } from "utils/numbers";
import { trpc } from "utils/trpc";
import MatchUp from "./MatchUp";

const ActiveMatchesTab = () => {
  const { gray } = useMyTheme();
  const previousLadderDayQuery = trpc.useQuery(["play.previousLadderDay"]);

  if (previousLadderDayQuery.isLoading) return <MySpinner />;
  if (previousLadderDayQuery.error)
    return <MyError message={previousLadderDayQuery.error.message} />;

  const previousLadderDay = previousLadderDayQuery.data!;

  return (
    <>
      {previousLadderDay && previousLadderDay.matches.length > 0 && (
        <>
          {[1].map((round) => (
            <Fragment key={round}>
              <Heading size="md">Round {round}</Heading>
              <Box fontSize="sm" fontWeight="bold">
                {new Date(
                  new Date(previousLadderDay.date).getTime() +
                    hoursToMilliseconds(round - 1)
                ).toLocaleString()}{" "}
                ({Intl.DateTimeFormat().resolvedOptions().timeZone})
              </Box>
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

export default ActiveMatchesTab;
