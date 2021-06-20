import { Button } from "@chakra-ui/button";
import { Image as ChakraImage } from "@chakra-ui/image";
import { Flex, Text } from "@chakra-ui/layout";
import { Fragment, useEffect, useState } from "react";
import { wonITZCount, wonTournamentCount } from "utils/constants";

interface BadgesProps {
  userId: number;
  userDiscordId: string;
  patreonTier: number | null;
  peakXP?: number;
}

const usersBadges = ({
  userId,
  userDiscordId,
  patreonTier,
  peakXP = -1,
}: BadgesProps) => {
  const result: { src: string; description: string; count: number }[] = [];

  const [itz1To9, itz10to19, itz20To29] = wonITZCount(userId);

  // PATREON

  if (patreonTier === 2) {
    result.push({
      src: "patreon.gif",
      description: "Supporter of sendou.ink on Patreon",
      count: 1,
    });
  }

  if ((patreonTier ?? -1) >= 3) {
    result.push({
      src: "patreonplus.gif",
      description: "Supporter+ of sendou.ink on Patreon",
      count: 1,
    });
  }

  // XP

  if (peakXP >= 3000) {
    result.push({
      src: "xp30.gif",
      description: "Peak X Power of 3000 or better",
      count: 1,
    });
  } else if (peakXP >= 2900) {
    result.push({
      src: "xp29.gif",
      description: "Peak X Power of 2900 or better",
      count: 1,
    });
  } else if (peakXP >= 2800) {
    result.push({
      src: "xp28.gif",
      description: "Peak X Power of 2800 or better",
      count: 1,
    });
  } else if (peakXP >= 2700) {
    result.push({
      src: "xp27.gif",
      description: "Peak X Power of 2700 or better",
      count: 1,
    });
  } else if (peakXP >= 2600) {
    result.push({
      src: "xp26.gif",
      description: "Peak X Power of 2600 or better",
      count: 1,
    });
  }

  // ITZ

  if (itz1To9 > 0) {
    result.push({
      src: "itz_red.gif",
      description: "Awarded for winning In The Zone 1-9",
      count: itz1To9,
    });
  }

  if (itz10to19 > 0) {
    result.push({
      src: "itz_orange.gif",
      description: "Awarded for winning In The Zone 10-19",
      count: itz10to19,
    });
  }

  if (itz20To29 > 0) {
    result.push({
      src: "itz_blue.gif",
      description: "Awarded for winning In The Zone 20-29",
      count: itz20To29,
    });
  }

  // Other tournaments

  if (
    wonTournamentCount({
      tournament: "LOBSTER_CROSSFIRE",
      discordId: userDiscordId,
    }) > 0
  ) {
    result.push({
      src: "lobster.gif",
      description: "Awarded for winning Lobster Crossfire",
      count: wonTournamentCount({
        tournament: "LOBSTER_CROSSFIRE",
        discordId: userDiscordId,
      }),
    });
  }

  if (
    wonTournamentCount({
      tournament: "MONDAY_AFTERPARTY",
      discordId: userDiscordId,
    }) > 0
  ) {
    result.push({
      src: "monday.gif",
      description: "Awarded for winning Monday Afterparty",
      count: wonTournamentCount({
        tournament: "MONDAY_AFTERPARTY",
        discordId: userDiscordId,
      }),
    });
  }

  if (
    wonTournamentCount({ tournament: "TRITON_CUP", discordId: userDiscordId }) >
    0
  ) {
    result.push({
      src: "triton.gif",
      description: "Awarded for winning Triton-Cup",
      count: wonTournamentCount({
        tournament: "TRITON_CUP",
        discordId: userDiscordId,
      }),
    });
  }

  return result;
};

const Badges = (props: {
  userId: number;
  userDiscordId: string;
  patreonTier: number | null;
  peakXP?: number;
}) => {
  const [showInfo, setShowInfo] = useState(false);
  const [imgsLoaded, setImgsLoaded] = useState(false);

  const badges = usersBadges(props);

  useEffect(() => {
    const loadImage = (imageUrl: string) => {
      return new Promise((resolve, reject) => {
        const loadImg = new Image();
        loadImg.src = imageUrl;
        loadImg.onload = () => setTimeout(() => resolve(imageUrl));
        loadImg.onerror = (err) => reject(err);
      });
    };

    Promise.all(badges.map((badge) => loadImage("/badges/" + badge.src)))
      .then(() => setImgsLoaded(true))
      .catch((err) => console.error("Failed to load images", err));
  }, []);

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
        {imgsLoaded &&
          badges.flatMap((badge) => {
            if (showInfo)
              return (
                <Fragment key={badge.src}>
                  <Flex justify="center" align="center" my={2}>
                    <ChakraImage
                      w={10}
                      h={10}
                      m={4}
                      src={`/badges/${badge.src}`}
                    />{" "}
                    <Text fontSize="sm">{badge.description}</Text>
                  </Flex>
                </Fragment>
              );
            return new Array(badge.count).fill(null).map((_, i) => {
              return (
                <ChakraImage
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
