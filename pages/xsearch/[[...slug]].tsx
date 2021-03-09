import { RankedMode } from "@prisma/client";
import XSearchPage, {
  XSearchPageProps,
} from "app/xrank/components/XSearchPage";
import xRankService from "app/xrank/service";
import { GetStaticPaths, GetStaticProps } from "next";
import { getLocalizedMonthYearString } from "utils/strings";

export const getStaticPaths: GetStaticPaths = async () => {
  const mostRecentResult = await xRankService.getMostRecentResult();

  if (!mostRecentResult) return { paths: [], fallback: false };

  return {
    paths: getMonthOptions(mostRecentResult.month, mostRecentResult.year)
      .flatMap(({ month, year }) => [
        {
          params: {
            slug: [year, month, "SZ"],
          },
        },
        {
          params: {
            slug: [year, month, "TC"],
          },
        },
        {
          params: {
            slug: [year, month, "RM"],
          },
        },
        {
          params: {
            slug: [year, month, "CB"],
          },
        },
      ])
      .concat({
        params: {
          slug: [],
        },
      }),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<XSearchPageProps> = async ({
  params,
}) => {
  const mostRecentResult = await xRankService.getMostRecentResult();

  if (!mostRecentResult) throw Error("No X Rank Placements");

  const slug = params!.slug
    ? (params!.slug as string[])
    : [`${mostRecentResult.year}`, `${mostRecentResult.month}`, "SZ"];

  if (slug.length !== 3) return { notFound: true };

  const year = Number(slug[0]);
  const month = Number(slug[1]);

  if (isNaN(month) || isNaN(year)) return { notFound: true };

  const placements = await xRankService.getTop500PlacementsByMonth({
    month,
    year,
    mode: slug[2] as RankedMode,
  });

  return {
    props: {
      placements,
      monthOptions: getMonthOptions(
        mostRecentResult.month,
        mostRecentResult.year
      ),
    },
    notFound: !placements.length,
  };
};

export function getMonthOptions(latestMonth: number, latestYear: number) {
  const monthChoices = [];
  let month = 5;
  let year = 2018;

  while (true) {
    // TODO set language
    const monthString = getLocalizedMonthYearString(month, year, "en");
    monthChoices.push({
      label: monthString,
      value: `${month},${year}`,
      month: `${month}`,
      year: `${year}`,
    });

    if (month === latestMonth && year === latestYear) break;

    month++;
    if (month === 13) {
      month = 1;
      year++;
    }
  }

  monthChoices.reverse();

  return monthChoices;
}

export default XSearchPage;
