import FreeAgentsPage from "app/freeagents/components/FreeAgentsPage";
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

export default FreeAgentsPage;
