import { Heading } from "@chakra-ui/react";
import MyLink from "components/common/MyLink";
import Head from "next/head";

const LinkingInfoPage = ({}) => {
  return (
    <>
      <Head>
        <title>How to link placements | sendou.ink</title>
      </Head>
      <>
        <Heading as="h1">How to link</Heading>
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
        <b>Lean#3146</b> directly. If you have already used the !register
        command in the past and just need to link now then use the{" "}
        <code>!sendoulink</code> command.
        <br />
        <br />
        Please note the results update <b>once a month</b> and league results
        below league power of 2200 are not included.
      </>
    </>
  );
};

export default LinkingInfoPage;
