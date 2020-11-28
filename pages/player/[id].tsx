import { t } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import PlayerTable from "components/player/PlayerTable";
import { GetStaticPaths, GetStaticProps } from "next";
import {
  GetPlayersTop500Placements,
  getPlayersTop500Placements,
} from "prisma/queries/getPlayersTop500Placements";

const PlayerPage = ({ placements }: Props) => {
  // TODO: spinner
  if (!placements) return null;

  return (
    <>
      <Breadcrumbs
        pages={[
          { name: t`Top 500 Browser`, link: "/xsearch" },
          { name: placements[0].playerName },
        ]}
      />
      <PlayerTable placements={placements} />
    </>
  );
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

export default PlayerPage;
