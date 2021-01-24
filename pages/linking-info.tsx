import { Heading } from "@chakra-ui/react";
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
        linked to your sendou.ink user. You need to DM the bot{" "}
        <b>Lanista#5266</b> on{" "}
        <MyLink href="https://discord.gg/sendou" isExternal>
          Discord
        </MyLink>{" "}
        to set it up.
        <br />
        <br />
        Simply DM the bot with <code>!register</code> command and follow
        instructions. If you have problems using Lanista you can DM{" "}
        <b>Lean#3146</b> directly.
      </MyContainer>
    </>
  );
};

export default LinkingInfoPage;
