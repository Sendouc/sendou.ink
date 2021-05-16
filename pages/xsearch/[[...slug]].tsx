import { Flex, Select } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { RankedMode } from "@prisma/client";
import ModeSelector from "components/common/ModeSelector";
import MyHead from "components/common/MyHead";
import Top500Table from "components/xsearch/Top500Table";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import xRankService, { Top500PlacementsByMonth } from "services/xsearch";
import { getLocalizedMonthYearString } from "utils/strings";

export interface XSearchPageProps {
  placements: Top500PlacementsByMonth;
  monthOptions: { label: string; value: string }[];
}

const XSearchPage = ({ placements, monthOptions }: XSearchPageProps) => {
  const [variables, setVariables] = useState<{
    month: number;
    year: number;
    mode: RankedMode;
  }>({
    month: Number(monthOptions[0].value.split(",")[0]),
    year: Number(monthOptions[0].value.split(",")[1]),
    mode: "SZ" as RankedMode,
  });

  const router = useRouter();

  useEffect(() => {
    router.replace(
      `/xsearch/${variables.year}/${variables.month}/${variables.mode}`
    );
  }, [variables]);

  //TODO: layout can be persistent between route changes
  return (
    <>
      <MyHead title={t`Top 500 Browser`} />
      <Flex flexDir={["column", null, "row"]} justify="space-between">
        <Select
          value={`${variables.month},${variables.year}`}
          onChange={(e) => {
            const [month, year] = e.target.value.split(",");

            setVariables({
              ...variables,
              month: Number(month),
              year: Number(year),
            });
          }}
          mb={4}
          maxW={64}
          size="sm"
          rounded="lg"
          mx={["auto", null, "0"]}
        >
          {monthOptions.map((monthYear) => (
            <option key={monthYear.value} value={monthYear.value}>
              {monthYear.label}
            </option>
          ))}
        </Select>
        <ModeSelector
          mode={variables.mode}
          setMode={(mode) => setVariables({ ...variables, mode })}
          mx={["auto", null, "0"]}
          mb={[4, null, 0]}
        />
      </Flex>
      <Top500Table placements={placements} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const mostRecentResult = await xRankService.getMostRecentResult();

  if (!mostRecentResult) return { paths: [], fallback: false };

  return {
    paths: [],
    fallback: "blocking",
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
