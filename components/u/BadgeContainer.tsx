import { Image as ChakraImage } from "@chakra-ui/image";
import { Flex, Text } from "@chakra-ui/react";
import { Fragment } from "react";

const BadgeContainer = ({
  showInfo,
  showBadges,
  badges,
}: {
  showInfo: boolean;
  showBadges: boolean;
  badges: {
    src: string;
    description: string;
    count: number;
  }[];
}) => {
  return (
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
      {showBadges &&
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
          return (
            <Fragment key={badge.src}>
              <ChakraImage
                key={`${badge.src}`}
                w={10}
                h={10}
                m={1}
                src={`/badges/${badge.src}`}
              />
              <Text
                fontSize="sm"
                style={{marginLeft: -5, marginTop: -25, paddingRight: 5, fontSize: '0.7rem', fontWeight: 'bold' }}
              >
                {`x${badge.count}`}
              </Text>
            </Fragment>
          )
        })}
    </Flex>
  );
};

export default BadgeContainer;
