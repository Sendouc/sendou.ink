import { PrismaClient } from "@prisma/client";
import {
  GetUserByIdentifierDocument,
  useGetUserByIdentifierQuery,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import { GetStaticPaths, GetStaticProps } from "next";
import Profile from "scenes/Profile";

const prisma = new PrismaClient();

export const getStaticPaths: GetStaticPaths = async () => {
  const users = await prisma.user.findMany({});
  return {
    paths: users.map((u) => ({ params: { identifier: u.discordId } })),
    fallback: true,
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
