import PlusHomePage, { PlusHomePageProps } from "components/plus/PlusHomePage";
import { GetStaticProps } from "next";
import plusService from "services/plus";

export const getStaticProps: GetStaticProps<PlusHomePageProps> = async ({
  params,
}) => {
  const suggestions = await plusService.getSuggestions();

  return {
    props: { suggestions: JSON.parse(JSON.stringify(suggestions)) },
    revalidate: 60,
  };
};

export default PlusHomePage;
