import { Box, Flex, Heading, useColorMode } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import Video from "components/common/Video";
import NavButtons from "components/layout/NavButtons";
import { useMyTheme } from "hooks/common";
import Image from "next/image";

const HomePage = () => {
  const { gray } = useMyTheme();
  const { colorMode } = useColorMode();

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
          alt=""
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
        Splatoon players. It&apos;s an{" "}
        <MyLink isExternal href="https://github.com/Sendouc/sendou.ink">
          open source project
        </MyLink>{" "}
        by{" "}
        <MyLink isExternal href="https://sendou.cc/">
          Sendou
        </MyLink>{" "}
        and <MyLink href="/about">contributors</MyLink>. To explore what you can
        do on the site you can check out a{" "}
        <MyLink isExternal href="https://www.youtube.com/watch?v=kQbvez9QnHc">
          tour video made by Chara
        </MyLink>
        .
      </Box>
    </>
  );
};

export default HomePage;
