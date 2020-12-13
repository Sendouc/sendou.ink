import { Alert, Container, Heading } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import Head from "next/head";

const LinkingInfoPage = ({}) => {
  return (
    <>
      <Head>
        <title>How to link placements | sendou.ink</title>
      </Head>
      <Container maxWidth="75ch">
        <Heading fontFamily="'Rubik', sans-serif" as="h1">
          How to link
        </Heading>
        This page explains how you can get your Top 500 and/or League placements
        linked to your sendou.ink user. You need to DM Sendou on{" "}
        <MyLink href="https://discord.gg/sendou" isExternal>
          Discord
        </MyLink>{" "}
        to set it up.
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
        placement. Note that the current ongoing month doesn't count. For
        example:
        <Alert status="success" variant="left-accent" mt={1}>
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
        to find the link you need there.
        <Alert status="success" variant="left-accent" mt={1}>
          Hey Sendou I want to link my placements. Here is my page
          https://sendou.ink/player/2307813338345724603
        </Alert>
      </Container>
    </>
  );
};

export default LinkingInfoPage;
