import { GetStaticPaths, GetStaticProps } from "next";
import PlusVotingHistoryPage, {
  PlusVotingHistoryPageProps,
} from "scenes/plus/PlusVotingHistoryPage";
import plusService from "scenes/plus/plusService";

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: "blocking",
  };
};

export const getStaticProps: GetStaticProps<PlusVotingHistoryPageProps> = async ({
  params,
}) => {
  const getSlug = async () => {
    const slug = Array.isArray(params!.slug) ? params!.slug : [];
    if (slug.length === 3) {
      return slug;
    }

    const mostRecent = await plusService.getMostRecentVotingWithResultsMonth();

    return ["1", mostRecent.year, mostRecent.month];
  };

  const [tier, year, month] = (await getSlug()).map((param) => Number(param));
  const summaries = await plusService.getVotingSummariesByMonthAndTier({
    tier: tier as any,
    year,
    month,
  });

  if (!summaries.length) return { notFound: true };

  return {
    props: { summaries },
  };
};

export default PlusVotingHistoryPage;
