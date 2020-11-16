import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import PlayerTable from "components/player/PlayerTable";
import { GetStaticPaths, GetStaticProps } from "next";
import DBClient from "prisma/client";
import {
  GetPlayersTop500Placements,
  getPlayersTop500Placements,
} from "prisma/queries/getPlayersTop500Placements";

const prisma = DBClient.getInstance().prisma;

// FIXME: should probably not prerender all player pages -- where userId is not null
export const getStaticPaths: GetStaticPaths = async () => {
  const players = await prisma.player.findMany({});
  return {
    paths: players.map((p) => ({ params: { id: p.switchAccountId } })),
    fallback: true,
  };
};

interface Props {
  placements: GetPlayersTop500Placements;
}

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const placements = await getPlayersTop500Placements(params!.id as string);

  return {
    props: {
      placements,
    },
    notFound: !placements.length,
  };
};

const PlayerPage = ({ placements }: Props) => {
  // FIXME: spinner
  if (!placements) return null;

  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Top 500 Browser`, link: "/top500" },
          { name: placements[0].playerName },
        ]}
      />
      <PlayerTable placements={placements} />
    </>
  );
};

export default PlayerPage;
