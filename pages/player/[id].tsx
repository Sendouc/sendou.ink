import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import PlayerTable from "components/player/PlayerTable";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  GetPlayersTop500Placements,
  getPlayersTop500Placements,
} from "prisma/queries/getPlayersTop500Placements";

const PlayerPage = ({ player }: Props) => {
  // TODO: spinner
  if (!player) return null;

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
  // const players = await prisma.player.findMany({
  //   where: { NOT: [{ userId: null }] },
  // });
  // return {
  //   paths: players.map((p) => ({ params: { id: p.switchAccountId } })),
  //   fallback: true,
  // };
  return {
    paths: [],
    fallback: true,
  };
};

interface Props {
  player: GetPlayersTop500Placements;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const player = await getPlayersTop500Placements(params!.id as string);

  if (!player || !player.placements) return { notFound: true };

  return {
    props: {
      player: { ...player, leaguePlacements: null } as any,
    },
  };
};

export default PlayerPage;
