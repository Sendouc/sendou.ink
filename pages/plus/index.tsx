import HeaderBanner from "components/layout/HeaderBanner";
import PlusHomePage, { PlusHomePageProps } from "components/plus/PlusHomePage";
import { GetStaticProps } from "next";
import plusService from "services/plus";

export const getStaticProps: GetStaticProps<PlusHomePageProps> = async () => {
  const suggestions = await plusService.getSuggestions();

  return {
    props: { suggestions: JSON.parse(JSON.stringify(suggestions)) },
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
