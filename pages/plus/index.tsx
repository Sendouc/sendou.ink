import PlusHomePage from "app/plus/components/PlusHomePage";
import HeaderBanner from "components/layout/HeaderBanner";
import { appRouter } from "pages/api/trpc/[trpc]";
import { trpc } from "utils/trpc";

export const getStaticProps = async () => {
  const ssr = trpc.ssr(appRouter, {});

  await Promise.all([
    ssr.prefetchQuery("plus.suggestions"),
    ssr.prefetchQuery("plus.statuses"),
  ]);

  return {
    props: {
      dehydratedState: trpc.dehydrate(),
    },
    revalidate: 60,
  };
};

// @ts-expect-error
PlusHomePage.header = (
  <HeaderBanner
    icon="plus"
    title="Plus Server"
    subtitle="View all the suggested players for this month"
  />
);

export default PlusHomePage;
