import { Button } from "@chakra-ui/button";
import { Checkbox } from "@chakra-ui/checkbox";
import { Input } from "@chakra-ui/input";
import { Box, Flex, Grid, Stack, Text } from "@chakra-ui/layout";
import { Radio, RadioGroup } from "@chakra-ui/radio";
import NewTable from "components/common/NewTable";
import { useTeamSplitterPage } from "hooks/team-splitter";
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

const TeamSplitterPage = () => {
  const { state, dispatch } = useTeamSplitterPage();

  return (
    <>
      {state.matches.length === 0 ? (
        <>
          <Box maxW={80}>
            {new Array(10).fill(null).map((_, i) => {
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
          <Box my={6}>
            <Text
              as="label"
              display="block"
              mb="8px"
              fontSize="sm"
              fontWeight="bold"
            >
              Choose 2 players that should never be placed in the same team
              (optional)
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
              <Flex flexWrap="wrap">
                {state.players
                  .filter((p) => p.name !== "")
                  .map((p) => (
                    <Checkbox
                      mr={4}
                      key={p.id}
                      isChecked={state.noPlacingToSameTeam.includes(p.id)}
                      isDisabled={
                        !state.noPlacingToSameTeam.includes(p.id) &&
                        state.noPlacingToSameTeam.length === 2
                      }
                      onChange={(e) =>
                        dispatch({
                          type: "SET_NO_PLACING_TO_SAME_TEAM",
                          id: p.id,
                          checked: e.target.checked,
                        })
                      }
                    >
                      {p.name}
                    </Checkbox>
                  ))}
              </Flex>
            </RadioGroup>
          </Box>
          <Flex alignItems="center">
            <Button
              onClick={() => dispatch({ type: "CREATE_FIRST_MATCH" })}
              disabled={Boolean(state.errorWithPlayers)}
              mr={4}
            >
              Start
            </Button>
            <Text fontSize="sm" color="red.500">
              {state.errorWithPlayers}
            </Text>
          </Flex>
        </>
      ) : (
        <>
          <Grid
            gridTemplateColumns="1fr 1fr 1fr"
            maxW="32rem"
            gridColumnGap="2rem"
            gridRowGap="0.5rem"
            mx="auto"
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
            <Text
              fontSize="sm"
              fontWeight="bold"
              borderBottom="2px solid"
              borderColor="gray.500"
            >
              Spectators
            </Text>
            {state.matches[state.matches.length - 1].alpha.map((player, i) => {
              return (
                <Fragment key={player}>
                  <Text>{player}</Text>
                  <Text>
                    {state.matches[state.matches.length - 1].bravo[i]}
                  </Text>
                  <Text>
                    {state.matches[state.matches.length - 1].spectators[i] ??
                      ""}
                  </Text>
                </Fragment>
              );
            })}
            <Button
              size="sm"
              backgroundColor="#F63778"
              fontSize="xs"
              _hover={{ backgroundColor: "#F63778" }}
              _active={{ backgroundColor: "#F63778" }}
              onClick={() => dispatch({ type: "SET_WINNER", winner: "alpha" })}
            >
              Alpha won
            </Button>
            <Button
              size="sm"
              backgroundColor="#01E262"
              fontSize="xs"
              _hover={{ backgroundColor: "#01E262" }}
              _active={{ backgroundColor: "#01E262" }}
              onClick={() => dispatch({ type: "SET_WINNER", winner: "bravo" })}
            >
              Bravo won
            </Button>
            {state.matches.length > 1 ? (
              <Button
                size="sm"
                fontSize="xs"
                onClick={() => dispatch({ type: "UNDO_LATEST_MATCH" })}
                colorScheme="gray"
              >
                Undo last
              </Button>
            ) : null}
          </Grid>
          <Button
            my={4}
            size="sm"
            variant="ghost"
            onClick={() => {
              navigator.clipboard.writeText(
                state.players
                  .sort((a, b) => winLossRatio(b)[1] - winLossRatio(a)[1])
                  .map(
                    (player) =>
                      `${player.name} - ${winLossRatio(player)[0]} (${
                        player.winCount
                      }W/${player.lossCount}L)`
                  )
                  .join("\n")
              );
            }}
          >
            Copy leaderboards to clipboard
          </Button>
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
          <Button
            display="block"
            size="sm"
            mx="auto"
            mt={6}
            variant="outline"
            colorScheme="red"
            onClick={() => dispatch({ type: "RESET" })}
          >
            Reset
          </Button>
        </>
      )}
    </>
  );
};

export default TeamSplitterPage;
