import { Box, Container, Flex, Heading, useColorMode } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "lib/useMyTheme";
import Image from "next/image";
import Link from "next/link";

const Home = () => {
  const { gray } = useMyTheme();
  const { colorMode } = useColorMode();
  return (
    <>
      <Box textAlign="center">
        <Image
          className="rgb"
          src={`/layout/posterGirl_${colorMode}.png`}
          width={481}
          height={400}
          priority
        />
        <Heading size="2xl">Sendou.ink</Heading>
        <Box fontWeight="semibold" letterSpacing="wide" color={gray}>
          Competitive Splatoon Hub
        </Box>
      </Box>
      <Container>
        <PageInfoSection location="xsearch" title={t`Top 500`}>
          <Trans>
            All the Top 500 results and leaderboards derived from them.
          </Trans>
        </PageInfoSection>
        <PageInfoSection location="builds" title={t`Builds`}>
          <Trans>
            View builds by some of the best players in the world and submit your
            own.
          </Trans>
        </PageInfoSection>
        <PageInfoSection location="analyzer" title={t`Build Analyzer`}>
          <Trans>
            What exactly is the effect of your builds? Guess no more.
          </Trans>
        </PageInfoSection>
        <PageInfoSection location="u" title={t`User Search`}>
          <Trans>
            You can make your own page. Use this tool to find other users'
            pages.
          </Trans>
        </PageInfoSection>
        <PageInfoSection location="calendar" title={t`Calendar`}>
          <Trans>All the events happening in the community in one place.</Trans>
        </PageInfoSection>
        <PageInfoSection location="freeagents" title={t`Free Agents`}>
          <Trans>Find your next teammates.</Trans>
        </PageInfoSection>
        <PageInfoSection location="plans" title={t`Map Planner`}>
          <Trans>Make your battle plans by drawing on over 100 maps.</Trans>
        </PageInfoSection>
        <PageInfoSection location="tournaments" title={t`Tournaments`}>
          <Trans>
            Data on tournaments spanning over years gathered by ganbawoomy.
          </Trans>
        </PageInfoSection>
        <PageInfoSection location="plus" title={t`Plus Server`}>
          <Trans>
            Information related to +1 and +2. Voting results, suggested players
            and FAQ.
          </Trans>
        </PageInfoSection>
      </Container>
      <Box textAlign="center" mt={24} fontSize="sm" color={gray}>
        <Trans>
          All art by{" "}
          <MyLink href="https://twitter.com/borzoic_" isExternal>
            borzoic
          </MyLink>
        </Trans>
      </Box>
    </>
  );

  function PageInfoSection({
    location,
    title,
    children,
  }: {
    location: string;
    title: string;
    children: React.ReactNode;
  }) {
    return (
      <Flex mt={12} alignItems="center" flexDir="column" textAlign="center">
        <Link href={`/${location}`}>
          <a>
            <Image src={`/layout/${location}.png`} width={128} height={128} />
          </a>
        </Link>
        <Heading mb={2}>
          <Link href={`/${location}`}>
            <a>{title}</a>
          </Link>
        </Heading>
        {children}
      </Flex>
    );
  }
};

export default Home;
