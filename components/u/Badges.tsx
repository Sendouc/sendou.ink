import { Button } from "@chakra-ui/button";
import { Image } from "@chakra-ui/image";
import { Divider, Flex, Text } from "@chakra-ui/layout";
import { Fragment, useState } from "react";
import { wonITZCount, wonTournamentCount } from "utils/constants";

const Badges = ({
  userId,
  userDiscordId,
  patreonTier,
  peakXP = -1,
}: {
  userId: number;
  userDiscordId: string;
  patreonTier: number | null;
  peakXP?: number;
}) => {
  const [showInfo, setShowInfo] = useState(false);

  let badges: { src: string; description: string; count: number }[] = [];

  const [itz1To9, itz10to19, itz20To29] = wonITZCount(userId);

  // PATREON

  if (patreonTier === 2) {
    badges.push({
      src: "patreon.gif",
      description: "Supporter of sendou.ink on Patreon",
      count: 1,
    });
  }

  if ((patreonTier ?? -1) >= 3) {
    badges.push({
      src: "patreonplus.gif",
      description: "Supporter+ of sendou.ink on Patreon",
      count: 1,
    });
  }

  // XP

  if (peakXP >= 3000) {
    badges.push({
      src: "xp30.gif",
      description: "Peak X Power of 3000 or better",
      count: 1,
    });
  } else if (peakXP >= 2900) {
    badges.push({
      src: "xp29.gif",
      description: "Peak X Power of 2900 or better",
      count: 1,
    });
  } else if (peakXP >= 2800) {
    badges.push({
      src: "xp28.gif",
      description: "Peak X Power of 2800 or better",
      count: 1,
    });
  } else if (peakXP >= 2700) {
    badges.push({
      src: "xp27.gif",
      description: "Peak X Power of 2700 or better",
      count: 1,
    });
  } else if (peakXP >= 2600) {
    badges.push({
      src: "xp26.gif",
      description: "Peak X Power of 2600 or better",
      count: 1,
    });
  }

  // ITZ

  if (itz1To9 > 0) {
    badges.push({
      src: "itz_red.gif",
      description: "Awarded for winning In The Zone 1-9",
      count: itz1To9,
    });
  }

  if (itz10to19 > 0) {
    badges.push({
      src: "itz_orange.gif",
      description: "Awarded for winning In The Zone 10-19",
      count: itz10to19,
    });
  }

  if (itz20To29 > 0) {
    badges.push({
      src: "itz_blue.gif",
      description: "Awarded for winning In The Zone 20-29",
      count: itz20To29,
    });
  }

  // Triton-Cup

  if (
    wonTournamentCount({ tournament: "TRITON", discordId: userDiscordId }) > 0
  ) {
    badges.push({
      src: "triton.gif",
      description: "Awarded for winning Triton-Cup",
      count: wonTournamentCount({
        tournament: "TRITON",
        discordId: userDiscordId,
      }),
    });
  }

  if (badges.length === 0) return null;

  return (
    <>
      <Flex
        flexDir={showInfo ? "column" : "row"}
        flexWrap="wrap"
        align="center"
        justify="center"
        bg="black"
        color="white"
        rounded="lg"
        maxW={48}
        mx="auto"
        my={3}
      >
        {badges.flatMap((badge) => {
          if (showInfo)
            return (
              <Fragment key={badge.src}>
                <Flex justify="center" align="center" my={2}>
                  <Image w={10} h={10} m={4} src={`/badges/${badge.src}`} />{" "}
                  <Text fontSize="sm">{badge.description}</Text>
                </Flex>
              </Fragment>
            );
          return new Array(badge.count).fill(null).map((_, i) => {
            return (
              <Image
                key={`${badge.src}-${i}`}
                w={10}
                h={10}
                m={1}
                src={`/badges/${badge.src}`}
              />
            );
          });
        })}
      </Flex>
      <Button
        my={3}
        mx="auto"
        size="xs"
        display="block"
        variant="ghost"
        onClick={() => setShowInfo(!showInfo)}
      >
        {showInfo ? "Hide info" : "Show info"}
      </Button>
    </>
  );
};

export default Badges;
