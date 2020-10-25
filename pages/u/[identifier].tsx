import { PrismaClient } from "@prisma/client";
import {
  GetUserByIdentifierDocument,
  useGetUserByIdentifierQuery,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import Profile from "scenes/Profile";

const prisma = new PrismaClient();

// FIXME: should try to make it so that /u/Sendou and /u/234234298348 point to the same page
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
  const { data } = useGetUserByIdentifierQuery({
    variables: { identifier },
  });
  const router = useRouter();

  // FIXME: handle fallback
  const getUserByIdentifier = data?.getUserByIdentifier;
  if (!getUserByIdentifier && typeof window !== "undefined") {
    router.push("/404");
  }

  return getUserByIdentifier ? <Profile user={getUserByIdentifier} /> : null;
};

export default ProfilePage;
