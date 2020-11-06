import { Radio, RadioGroup, Select, Stack } from "@chakra-ui/core";
import { t } from "@lingui/macro";
import { PrismaClient } from "@prisma/client";
import Breadcrumbs from "components/Breadcrumbs";
import Top500Table from "components/top500/Top500Table";
import { RankedMode } from "generated/graphql";
import { getLocalizedMonthYearString } from "lib/strings";
import { GetStaticProps } from "next";
import {
  getTop500PlacementsByMonth,
  GetTop500PlacementsByMonthData,
} from "prisma/queries/getTop500PlacementsByMonth";
import { useState } from "react";

const prisma = new PrismaClient();

const getMonthOptions = (latestMonth: number, latestYear: number) => {
  const monthChoices = [];
  let month = 5;
  let year = 2018;

  while (true) {
    // FIXME: set language
    const monthString = getLocalizedMonthYearString(month, year, "en");
    monthChoices.push({ label: monthString, value: `${month},${year}` });

    if (month === latestMonth && year === latestYear) break;

    month++;
    if (month === 13) {
      month = 1;
      year++;
    }
  }

  monthChoices.reverse();

  return monthChoices;
};

interface Props {
  placements: GetTop500PlacementsByMonthData;
  monthOptions: { label: string; value: string }[];
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const mostRecentResult = await prisma.xRankPlacement.findFirst({
    orderBy: [{ month: "desc" }, { year: "desc" }],
  });

  if (!mostRecentResult) throw Error("No X Rank Placements");

  const placements = await getTop500PlacementsByMonth({
    prisma,
    month: 12,
    year: 2020,
    mode: "SZ",
  });

  return {
    props: {
      placements,
      monthOptions: getMonthOptions(
        mostRecentResult.month,
        mostRecentResult.year
      ),
    },
  };
};

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

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Top 500 Browser` }]} />
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
        mt={8}
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

export default XSearchPage;
