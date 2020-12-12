import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import QuadTable from "components/player/QuadTable";
import TwinTable from "components/player/TwinTable";
import XRankTable from "components/player/XRankTable";
import { GetStaticPaths, GetStaticProps } from "next";
import prisma from "prisma/client";
import {
  getPlayerWithPlacements,
  GetPlayerWithPlacementsData,
} from "prisma/queries/getPlayerWithPlacements";
import { useState } from "react";

interface Props {
  player: GetPlayerWithPlacementsData;
}

const PlayerPage = (props: Props) => {
  const player = props.player!;

  const [tab, setTab] = useState<"XRANK" | "TWIN" | "QUAD">("QUAD");

  console.log({ player });

  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Top 500 Browser`, link: "/xsearch" },
          { name: getPlayerName() },
        ]}
      />

      {tab === "XRANK" && <XRankTable player={player} />}
      {tab === "TWIN" && <TwinTable player={player} />}
      {tab === "QUAD" && <QuadTable player={player} />}
    </>
  );

  function getPlayerName() {
    if (player?.placements.length) return player.placements[0].playerName;

    return "?";
  }
};

export const getStaticPaths: GetStaticPaths = async () => {
  const players = await prisma.player.findMany({
    where: { NOT: [{ userId: null }] },
  });
  return {
    paths: players.map((p) => ({ params: { id: p.switchAccountId } })),
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const player = await getPlayerWithPlacements(params!.id as string);

  if (!player) return { notFound: true };

  return {
    props: {
      player: player,
    },
  };
};

export default PlayerPage;
