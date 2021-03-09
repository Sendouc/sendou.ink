import { XTrendsPageProps } from "app/xrank/components/XTrendsPage";
import xRankService from "app/xrank/service";
import { GetStaticProps } from "next";

export { default as default } from "app/xrank/components/XTrendsPage";

export const getStaticProps: GetStaticProps<XTrendsPageProps> = async () => {
  const trends = await xRankService.getXTrends();

  return { props: { trends } };
};
