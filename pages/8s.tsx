import { Button } from "@chakra-ui/button";
import { Input } from "@chakra-ui/input";
import { Box, Grid, Stack, Text } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import NewTable from "components/common/NewTable";
import { useEightsPage } from "hooks/8s";
import { Fragment } from "react";

const winLossRatio = ({
  winCount,
  lossCount,
}: {
  winCount: number;
  lossCount: number;
}): [ratioWithPrefix: string, ratio: number] => {
  const ratio = winCount - lossCount;
  let prefix = "";

  if (ratio > 0) prefix = "+";

  return [`${prefix}${ratio}`, ratio];
};

const EightsPage = () => {
  const { state, dispatch } = useEightsPage();

  return (
    <>
      {state.matches.length === 0 ? (
        <>
          <Box maxW={80}>
            {new Array(8).fill(null).map((_, i) => {
              return (
                <Box key={i} my={4}>
                  <Text
                    as="label"
                    display="block"
                    mb="8px"
                    fontSize="sm"
                    fontWeight="bold"
                  >
                    Player {i + 1}
                  </Text>
                  <Input
                    value={state.players[i]?.name ?? ""}
                    onChange={(e) =>
                      dispatch({
                        type: "SET_PLAYER",
                        number: i + 1,
                        name: e.target.value,
                      })
                    }
                  />
                </Box>
              );
            })}
          </Box>
          <Box my={6}>
            <Text
              as="label"
              display="block"
              mb="8px"
              fontSize="sm"
              fontWeight="bold"
            >
              Amount of rounds with same teams
            </Text>
            <RadioGroup
              onChange={(value) =>
                dispatch({
                  type: "SET_AMOUNT_OF_ROUNDS_WITH_SAME_TEAMS",
                  amountOfRoundsWithSameTeams: Number(value),
                })
              }
              value={String(state.amountOfRoundsWithSameTeams)}
            >
              <Stack direction="row">
                <Radio value="1">1</Radio>
                <Radio value="2">2</Radio>
                <Radio value="3">3</Radio>
                <Radio value="4">4</Radio>
                <Radio value="5">5</Radio>
              </Stack>
            </RadioGroup>
          </Box>
          <Button onClick={() => dispatch({ type: "CREATE_FIRST_MATCH" })}>
            Start
          </Button>
        </>
      ) : (
        <>
          <Grid
            gridTemplateColumns="1fr 1fr"
            maxW={80}
            gridColumnGap="2rem"
            gridRowGap="0.5rem"
            mb={8}
          >
            <Text
              fontSize="sm"
              fontWeight="bold"
              borderBottom="2px solid"
              borderColor="#F63778"
            >
              Alpha
            </Text>
            <Text
              fontSize="sm"
              fontWeight="bold"
              borderBottom="2px solid"
              borderColor="#01E262"
            >
              Bravo
            </Text>
            {state.matches[state.matches.length - 1].alpha.map((player, i) => {
              return (
                <Fragment key={player}>
                  <Text>{player}</Text>
                  <Text>
                    {state.matches[state.matches.length - 1].bravo[i]}
                  </Text>
                </Fragment>
              );
            })}
            <Button
              size="sm"
              backgroundColor="#F63778"
              onClick={() => dispatch({ type: "SET_WINNER", winner: "alpha" })}
            >
              Alpha won
            </Button>
            <Button
              size="sm"
              backgroundColor="#01E262"
              onClick={() => dispatch({ type: "SET_WINNER", winner: "bravo" })}
            >
              Bravo won
            </Button>
          </Grid>
          <NewTable
            caption="Leaderboards"
            headers={[
              { name: "name", dataKey: "name" },
              { name: "wins", dataKey: "wins" },
              { name: "losses", dataKey: "losses" },
              { name: "ratio", dataKey: "ratio" },
            ]}
            data={state.players
              .sort((a, b) => winLossRatio(b)[1] - winLossRatio(a)[1])
              .map((player) => ({
                id: player.id,
                name: player.name,
                wins: player.winCount,
                losses: player.lossCount,
                ratio: winLossRatio(player)[0],
              }))}
          />
        </>
      )}
    </>
  );
};

export default EightsPage;
