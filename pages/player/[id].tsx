import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import PlayerTable from "components/player/PlayerTable";
import { GetStaticPaths, GetStaticProps } from "next";
import prisma from "prisma/client";
import {
  getPlayerWithPlacements,
  GetPlayerWithPlacementsData,
} from "prisma/queries/getPlayerWithPlacements";

const PlayerPage = ({ player }: Props) => {
  // TODO: spinner
  if (!player) return null;

  console.log({ player });

  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Top 500 Browser`, link: "/xsearch" },
          { name: getPlayerName() },
        ]}
      />
      <PlayerTable placements={player.placements} />
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
    fallback: true,
  };
};

interface Props {
  player: GetPlayerWithPlacementsData;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const player = await getPlayerWithPlacements(params!.id as string);

  if (!player || !player.placements) return { notFound: true };

  return {
    props: {
      player: player,
    },
  };
};

export default PlayerPage;
