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
  const apolloClient = initializeApollo();

  console.log({ params });

  await apolloClient.query({
    query: GetUserByIdentifierDocument,
    variables: {
      // FIXME: why ! needed?
      identifier: params!.identifier,
    },
  });

  console.log(apolloClient.cache.extract());

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
    },
    revalidate: 1,
  };
};

const ProfilePage = () => {
  const { getUserByIdentifier } = useGetUserByIdentifierQuery().data!;
  return <Profile user={getUserByIdentifier!} />;
};

export default ProfilePage;
