import { Radio, RadioGroup, Select, Stack } from "@chakra-ui/react";
import { t } from "@lingui/macro";
import { RankedMode } from "@prisma/client";
import HeaderBanner from "components/layout/HeaderBanner";
import Top500Table from "components/top500/Top500Table";
import { GetStaticPaths, GetStaticProps } from "next";
import { useRouter } from "next/router";
import prisma from "prisma/client";
import {
  getTop500PlacementsByMonth,
  GetTop500PlacementsByMonthData,
} from "prisma/queries/getTop500PlacementsByMonth";
import { useEffect, useState } from "react";
import { getLocalizedMonthYearString } from "utils/strings";

interface Props {
  placements: GetTop500PlacementsByMonthData;
  monthOptions: { label: string; value: string }[];
}

const XSearchPage = ({ placements, monthOptions }: Props) => {
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
      >
        {monthOptions.map((monthYear) => (
          <option key={monthYear.value} value={monthYear.value}>
            {monthYear.label}
          </option>
        ))}
      </Select>
      <RadioGroup
        value={variables.mode}
        onChange={(value) =>
          setVariables({ ...variables, mode: value as RankedMode })
        }
        mt={4}
        mb={8}
      >
        <Stack direction="row">
          <Radio value="SZ">{t`SZ`}</Radio>
          <Radio value="TC">{t`TC`}</Radio>
          <Radio value="RM">{t`RM`}</Radio>
          <Radio value="CB">{t`CB`}</Radio>
        </Stack>
      </RadioGroup>
      <Top500Table placements={placements} />
    </>
  );
};

export const getStaticPaths: GetStaticPaths = async () => {
  const mostRecentResult = await prisma.xRankPlacement.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

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

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const mostRecentResult = await prisma.xRankPlacement.findFirst({
    orderBy: [{ year: "desc" }, { month: "desc" }],
  });

  if (!mostRecentResult) throw Error("No X Rank Placements");

  const slug = params!.slug
    ? (params!.slug as string[])
    : [`${mostRecentResult.year}`, `${mostRecentResult.month}`, "SZ"];

  if (slug.length !== 3) return { notFound: true };

  const year = Number(slug[0]);
  const month = Number(slug[1]);

  if (isNaN(month) || isNaN(year)) return { notFound: true };

  const placements = await getTop500PlacementsByMonth({
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

XSearchPage.header = (
  <HeaderBanner
    icon="xsearch"
    title="Top 500 Browser"
    subtitle="History of X Rank"
  />
);

export default XSearchPage;
