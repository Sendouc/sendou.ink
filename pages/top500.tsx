import { Radio, RadioGroup, Select, Stack } from "@chakra-ui/core";
import { PrismaClient } from "@prisma/client";
import LoadingBoundary from "components/LoadingBoundary";
import PageHeader from "components/PageHeader";
import {
  GetXRankPlacementsDocument,
  GetXRankPlacementsQueryVariables,
  RankedMode,
  useGetXRankPlacementsQuery,
} from "generated/graphql";
import { initializeApollo } from "lib/apollo";
import { getLocalizedMonthYearString } from "lib/getLocalizedMontYearString";
import { useTranslation } from "lib/useMockT";
import { GetStaticProps } from "next";
import { useState } from "react";
import XSearch from "scenes/XSearch";

const prisma = new PrismaClient();

const getMonthOptions = (latestMonth: number, latestYear: number) => {
  const monthChoices = [];
  let month = 5;
  let year = 2018;

  while (true) {
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

export const getStaticProps: GetStaticProps = async () => {
  const apolloClient = initializeApollo(null, { prisma });

  const mostRecentResult = await prisma.xRankPlacement.findFirst({
    orderBy: [{ month: "desc" }, { year: "desc" }],
  });

  if (!mostRecentResult) throw Error("No X Rank Placements");

  await apolloClient.query({
    query: GetXRankPlacementsDocument,
    variables: {
      month: mostRecentResult.month,
      year: mostRecentResult.year,
      mode: "SZ",
    },
  });

  return {
    props: {
      initialApolloState: apolloClient.cache.extract(),
      monthOptions: getMonthOptions(
        mostRecentResult.month,
        mostRecentResult.year
      ),
    },
  };
};

const XSearchPage = ({
  monthOptions,
}: {
  monthOptions: { label: string; value: string }[];
}) => {
  const { t } = useTranslation();

  const [variables, setVariables] = useState<GetXRankPlacementsQueryVariables>({
    month: Number(monthOptions[0].value.split(",")[0]),
    year: Number(monthOptions[0].value.split(",")[1]),
    mode: "SZ" as RankedMode,
  });
  const { data, loading, error } = useGetXRankPlacementsQuery({
    variables,
  });

  return (
    <>
      <PageHeader title="Top 500" />
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
          <Radio value="SZ">{t("plans;splatZonesShort")}</Radio>
          <Radio value="TC">{t("plans;towerControlShort")}</Radio>
          <Radio value="RM">{t("plans;rainMakerShort")}</Radio>
          <Radio value="CB">{t("plans;clamBlitzShort")}</Radio>
        </Stack>
      </RadioGroup>
      <LoadingBoundary loading={loading} error={error}>
        <XSearch placements={data?.getXRankPlacements!} />
      </LoadingBoundary>
    </>
  );
};

export default XSearchPage;
