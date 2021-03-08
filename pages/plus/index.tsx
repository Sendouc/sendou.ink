import PlusHomePage, {
  PlusHomePageProps,
} from "app/plus/components/PlusHomePage";
import plusService from "app/plus/service";
import HeaderBanner from "components/layout/HeaderBanner";
import { GetStaticProps } from "next";

export const getStaticProps: GetStaticProps<PlusHomePageProps> = async () => {
  const [suggestions, statuses] = await Promise.all([
    plusService.getSuggestions(),
    plusService.getPlusStatuses(),
  ]);

  return {
    props: {
      suggestions: JSON.parse(JSON.stringify(suggestions)),
      statuses: JSON.parse(JSON.stringify(statuses)),
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
