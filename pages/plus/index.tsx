import PlusHomePage from "app/plus/components/PlusHomePage";
import HeaderBanner from "components/layout/HeaderBanner";
import { ssr } from "pages/api/trpc/[trpc]";
import { trpc } from "utils/trpc";

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

// @ts-expect-error
PlusHomePage.header = (
  <HeaderBanner
    icon="plus"
    title="Plus Server"
    subtitle="View all the suggested players for this month"
  />
);

export default PlusHomePage;
