import { PrismaClient } from "@prisma/client";
import {
  GetPlayersXRankPlacementsDocument,
  useGetPlayersXRankPlacementsQuery,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import LoadingBoundary from "lib/components/LoadingBoundary";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Player from "scenes/Player";

const prisma = new PrismaClient();

// FIXME: should probably not prerender all player pages -- where userId is not null
export const getStaticPaths: GetStaticPaths = async () => {
  const players = await prisma.player.findMany({});
  return {
    paths: players.map((p) => ({ params: { id: p.playerId } })),
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = initializeApollo(null, { prisma: new PrismaClient() });

  const data = await apolloClient.query({
    query: GetPlayersXRankPlacementsDocument,
    variables: {
      // FIXME: why ! needed?
      playerId: params!.id,
    },
  });

  console.log({ params });
  console.log({ data });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      playerId: params!.id,
    },
    //notfound
  };
};

const PlayerPage = ({ playerId }: { playerId: string }) => {
  const router = useRouter();

  const { data } = useGetPlayersXRankPlacementsQuery({
    variables: { playerId },
    skip: router.isFallback,
  });

  return (
    <LoadingBoundary>
      <Player placements={data!.getPlayersXRankPlacements} />
    </LoadingBoundary>
  );
};

export default PlayerPage;
