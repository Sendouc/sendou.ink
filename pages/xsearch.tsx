import { PrismaClient } from "@prisma/client";
import {
  useXRankPlacementsQuery,
  XRankPlacementsDocument,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import XSearch from "scenes/XSearch";

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initializeApollo(null, { prisma: new PrismaClient() });

  await apolloClient.query({
    query: XRankPlacementsDocument,
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
  };
};

const XSearchPage = () => {
  const { data } = useXRankPlacementsQuery();
  const router = useRouter();

  // FIXME: handle fallback
  const getUserByIdentifier = data!.xRankPlacements;

  return <XSearch placements={getUserByIdentifier} />;
};

export default XSearchPage;
