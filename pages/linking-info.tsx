import { Alert, Heading } from "@chakra-ui/react";
import MyContainer from "components/common/MyContainer";
import MyLink from "components/common/MyLink";
import Head from "next/head";

const LinkingInfoPage = ({}) => {
  return (
    <>
      <Head>
        <title>How to link placements | sendou.ink</title>
      </Head>
      <MyContainer>
        <Heading fontFamily="'Rubik', sans-serif" as="h1">
          How to link
        </Heading>
        This page explains how you can get your Top 500 and/or League placements
        linked to your sendou.ink user. You need to DM Sendou on{" "}
        <MyLink href="https://discord.gg/sendou" isExternal>
          Discord
        </MyLink>{" "}
        to set it up.
        <br />
        <br />
        New placements get added monthly. For example if you are waiting on
        October 2020 placements (both X Rank and League) normally you can expect
        them to be added sometime in early November 2020. This depends on
        various factors though. Follow our{" "}
        <MyLink href="https://twitter.com/sendouink" isExternal>
          Twitter
        </MyLink>{" "}
        for updates.
        <Heading
          fontFamily="'Rubik', sans-serif"
          as="h2"
          size="md"
          mb={1}
          mt={8}
        >
          If you have finished a month in the Top 500 of X Rank.
        </Heading>
        You need the month, year, ranking and in-game name of your Top 500
        placement. Note that the current ongoing month doesn't count. <br />
        <br />
        For example:
        <Alert status="success" variant="left-accent" mt={2}>
          Hey Sendou I want to link my placements. I finished 456th in October
          2020 Rainmaker. My name was "Mr. Example"
        </Alert>
        <Heading
          fontFamily="'Rubik', sans-serif"
          as="h2"
          size="md"
          mb={1}
          mt={8}
        >
          If you only have placements in League
        </Heading>
        This one is a bit trickier. You need to find the link to your player
        profile. If you have a friend you played league with that has already
        linked their profile you can check their player page. You might be able
        to find the link you need there. <br />
        <br />
        For example:
        <Alert status="success" variant="left-accent" my={2}>
          Hey Sendou I want to link my placements. Here is my page
          https://sendou.ink/player/2307813338345724603
        </Alert>
        Note that placements with a power less than 2200 are not included.
      </MyContainer>
    </>
  );
};

export default LinkingInfoPage;
