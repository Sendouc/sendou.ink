import { Box, Flex, Heading, useColorMode } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import NavButtons from "components/layout/NavButtons";
import { useMyTheme, useUser } from "hooks/common";
import Image from "next/image";

const HomePage = () => {
  const { bgColor, secondaryBgColor, gray } = useMyTheme();
  const { colorMode } = useColorMode();
  const [user] = useUser();

  return (
    <>
      <Heading
        color={gray}
        letterSpacing="0.25rem"
        fontSize="xl"
        textAlign="center"
      >
        Competitive Splatoon Hub
      </Heading>
      <Flex justify="center">
        <Image
          className="rgb"
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
      <NavButtons />
      <Box textAlign="center" mt={6}>
        The goal of sendou.ink is to provide useful tools and resources for
        Splatoon players. It's an{" "}
        <MyLink isExternal href="https://github.com/Sendouc/sendou.ink">
          open source project
        </MyLink>{" "}
        by{" "}
        <MyLink isExternal href="https://sendou.cc/">
          Sendou
        </MyLink>{" "}
        and <MyLink href="/about">contributors</MyLink>. Explore what you can do
        by visiting the pages above.
      </Box>
    </>
  );
};

export default HomePage;
