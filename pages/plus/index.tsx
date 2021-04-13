import PlusHomePage from "app/plus/components/PlusHomePage";
import { ssr } from "pages/api/trpc/[trpc]";

export const getStaticProps = async () => {
  await Promise.all([
    ssr.prefetchQuery("plus.suggestions"),
    ssr.prefetchQuery("plus.statuses"),
  ]);

  return {
    props: {
      dehydratedState: ssr.dehydrate(),
    },
    revalidate: 60,
  };
};

export default PlusHomePage;
