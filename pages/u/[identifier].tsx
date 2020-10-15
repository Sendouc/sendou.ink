import { PrismaClient } from "@prisma/client";
import {
  GetUserByIdentifierDocument,
  useGetUserByIdentifierQuery,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import { GetStaticPaths, GetStaticProps } from "next";
import Profile from "scenes/Profile";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [{ params: { identifier: "455039198672453645" } }],
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const apolloClient = initializeApollo(null, { prisma: new PrismaClient() });

  await apolloClient.query({
    query: GetUserByIdentifierDocument,
    variables: {
      // FIXME: why ! needed?
      identifier: params!.identifier,
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      identifier: params!.identifier,
    },
    revalidate: 1,
  };
};

const ProfilePage = ({ identifier }: { identifier: string }) => {
  const { getUserByIdentifier } = useGetUserByIdentifierQuery({
    variables: { identifier },
  }).data!;
  return <Profile user={getUserByIdentifier!} />;
};

export default ProfilePage;
