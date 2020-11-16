import {
    Box,
    Flex, Grid,


    Image, Tab, TabList,


    TabPanel, TabPanels, Tabs
} from "@chakra-ui/react";
import { Link } from "@reach/router";
import React, { useContext } from "react";
import { medalEmoji } from "../../assets/imageImports";
import useBreakPoints from "../../hooks/useBreakPoints";
import MyThemeContext from "../../themeContext";
import UserAvatar from "../common/UserAvatar";

interface LeaderboardPlayer {
  discord_user: {
    username: string;
    discord_id: string;
    discriminator: string;
    avatar?: string;
  };
  first: number;
  second: number;
  third: number;
  score: number;
}

interface DraftLeaderboardProps {
  leaderboards: {
    players: LeaderboardPlayer[];
    type: "DRAFTONE" | "DRAFTTWO";
  }[];
}

interface LeaderboardTabPanelProps {
  players: LeaderboardPlayer[];
}

const DraftLeaderboard: React.FC<DraftLeaderboardProps> = ({
  leaderboards,
}) => {
  const { themeColor, grayWithShade } = useContext(MyThemeContext);
  const isSmall = useBreakPoints(550);

  const plusOneLeaderboard = leaderboards.find((lb) => lb.type === "DRAFTONE");
  const plusTwoLeaderboard = leaderboards.find((lb) => lb.type === "DRAFTTWO");

  if (!plusOneLeaderboard && !plusTwoLeaderboard) return null;

  let placement = 1;
  let print = false;
  const LeaderboardTabPanel: React.FC<LeaderboardTabPanelProps> = ({
    players,
  }) => {
    return (
      <Grid
        gridTemplateColumns={
          isSmall ? "1fr 1fr 2fr" : "1fr 1fr 2fr 1fr 1fr 1fr"
        }
        gridRowGap="1em"
        maxW="550px"
      >
        {players.map((player, i, array) => {
          print = false;
          if (i === 0) {
            placement = 1;
            print = true;
          } else if (i > 0 && player.score !== array[i - 1].score) {
            placement = i + 1;
            print = true;
          }
          return (
            <React.Fragment key={player.discord_user.discord_id}>
              <Flex
                fontSize="xl"
                fontWeight="bolder"
                color={grayWithShade}
                alignItems="center"
                ml="0.5em"
              >
                {(print || i === 0) && <>{placement}</>}
              </Flex>

              <Link to={`/u/${player.discord_user.discord_id}`}>
                <UserAvatar
                  src={player.discord_user.avatar}
                  name={player.discord_user.username}
                />
              </Link>
              <Flex alignItems="center" fontSize="lg" fontWeight="bold">
                <Link to={`/u/${player.discord_user.discord_id}`}>
                  {player.discord_user.username}#
                  {player.discord_user.discriminator}
                </Link>
              </Flex>
              {!isSmall && (
                <>
                  <Flex
                    fontSize="xl"
                    fontWeight="bolder"
                    color={grayWithShade}
                    alignItems="center"
                  >
                    <Image
                      w="38px"
                      h="38px"
                      src={medalEmoji[1]}
                      alt="Placement emoji for 1st"
                    />
                    <Box as="span" mr="0.2em">
                      x
                    </Box>
                    {player.first}
                  </Flex>
                  <Flex
                    fontSize="xl"
                    fontWeight="bolder"
                    color={grayWithShade}
                    alignItems="center"
                  >
                    <Image
                      w="38px"
                      h="38px"
                      src={medalEmoji[2]}
                      alt="Placement emoji for 2nd"
                    />
                    <Box as="span" mr="0.2em">
                      x
                    </Box>
                    {player.second}
                  </Flex>
                  <Flex
                    fontSize="xl"
                    fontWeight="bolder"
                    color={grayWithShade}
                    alignItems="center"
                  >
                    <Image
                      w="38px"
                      h="38px"
                      src={medalEmoji[3]}
                      alt="Placement emoji for 3rd"
                    />
                    <Box as="span" mr="0.2em">
                      x
                    </Box>
                    {player.third}
                  </Flex>
                </>
              )}
            </React.Fragment>
          );
        })}
      </Grid>
    );
  };

  return (
    <Tabs
      //index={tabIndex}
      //onChange={chosenIndex => setTabIndex(chosenIndex)}
      isFitted
      variant="line"
      colorScheme={themeColor}
    >
      <TabList>
        {!!plusOneLeaderboard && <Tab>+1</Tab>}
        {!!plusTwoLeaderboard && <Tab>+2</Tab>}
      </TabList>
      <TabPanels mb="1em">
        {!!plusOneLeaderboard && (
          <TabPanel mt="1em">
            <LeaderboardTabPanel players={plusOneLeaderboard.players} />
          </TabPanel>
        )}
        {!!plusTwoLeaderboard && (
          <TabPanel mt="1em">
            <LeaderboardTabPanel players={plusTwoLeaderboard.players} />
          </TabPanel>
        )}
      </TabPanels>
    </Tabs>
  );
};

export default DraftLeaderboard;
