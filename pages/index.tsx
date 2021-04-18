import { Box, Flex, useColorMode } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import Image from "next/image";
import { navItems } from "utils/constants";

const HomePage = () => {
  const { bgColor, secondaryBgColor } = useMyTheme();
  const { colorMode } = useColorMode();

  return (
    <>
      <Flex align="center">
        <Image
          className="rgb"
          src={`/layout/posterGirl_${colorMode}.png`}
          width={481}
          height={400}
          priority
        />
        <Image
          className="rgb mirrored"
          src={`/layout/posterGirl_${colorMode}.png`}
          width={481}
          height={400}
          priority
        />
      </Flex>

      <Box fontSize="sm" textAlign="right">
        <Trans>
          All art by{" "}
          <MyLink href="https://twitter.com/borzoic_" isExternal>
            borzoic
          </MyLink>
        </Trans>
      </Box>
      <Flex mt={2} flexWrap="wrap" alignItems="center" justifyContent="center">
        {navItems.map(({ code, name }) => {
          return (
            <MyLink key={code} href={"/" + code} isColored={false} noUnderline>
              <Flex
                width="9rem"
                rounded="lg"
                p={1}
                m={2}
                fontSize="sm"
                fontWeight="bold"
                align="center"
                whiteSpace="nowrap"
                bg={secondaryBgColor}
                border="2px solid"
                borderColor={secondaryBgColor}
                _hover={{
                  bg: bgColor,
                }}
              >
                <Image
                  src={`/layout/${code}.png`}
                  height={32}
                  width={32}
                  priority
                />
                <Box ml={2}>{name}</Box>
              </Flex>
            </MyLink>
          );
        })}
      </Flex>
      <Box textAlign="center" mt={6}>
        The goal of sendou.ink is to provide useful tools and resources for
        Splatoon players. It's an open source project by Sendou and
        contributors. Explore what you can do by visiting the pages above.
      </Box>
    </>
  );
};

export default HomePage;
