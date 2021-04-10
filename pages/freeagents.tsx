import FreeAgentsPage from "app/freeagents/components/FreeAgentsPage";
import HeaderBanner from "components/layout/HeaderBanner";
import { ssr } from "./api/trpc/[trpc]";

export const getStaticProps = async () => {
  await ssr.prefetchQuery("freeAgents.posts");

  return {
    props: {
      dehydratedState: ssr.dehydrate(),
    },
    revalidate: 60,
  };
};

// @ts-expect-error
FreeAgentsPage.header = (
  <HeaderBanner
    icon="freeagents"
    title="Free Agents"
    subtitle="Meet your next teammates"
  />
);

export default FreeAgentsPage;
