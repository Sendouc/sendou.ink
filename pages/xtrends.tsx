import { Flex, Select } from "@chakra-ui/react";
import xRankService, { XTrends } from "app/xrank/service";
import ModeSelector from "components/common/ModeSelector";
import MyHead from "components/common/MyHead";
import Page from "components/common/Page";
import TrendTier from "components/xtrends/TrendTier";
import { useXTrends } from "hooks/xtrends";
import { GetStaticProps } from "next";

const tiers = [
  {
    label: "X",
    criteria: 6,
    color: "purple.700",
  },
  {
    label: "S+",
    criteria: 5,
    color: "red.700",
  },
  {
    label: "S",
    criteria: 4,
    color: "red.700",
  },
  {
    label: "A+",
    criteria: 3,
    color: "orange.700",
  },
  {
    label: "A",
    criteria: 2,
    color: "orange.700",
  },
  {
    label: "B+",
    criteria: 1.5,
    color: "yellow.700",
  },
  {
    label: "B",
    criteria: 1,
    color: "yellow.700",
  },
  {
    label: "C+",
    criteria: 0.4,
    color: "green.700",
  },
  {
    label: "C",
    criteria: 0.002, //1 in 500
    color: "green.700",
  },
] as const;

export interface XTrendsPageProps {
  trends: XTrends;
}

const XTrendsPage = ({ trends }: XTrendsPageProps) => {
  const {
    state,
    dispatch,
    weaponData,
    getDataForChart,
    monthOptions,
  } = useXTrends(trends);

  return (
    <>
      <MyHead title="Top 500 Trends" />
      <Page>
        {/* <Box color={gray} fontSize="sm" mb={8}>
          <Trans>
            Here you can find X Rank Top 500 usage tier lists. For example for a
            weapon to be in the X tier it needs at least 30 placements in that
            mode that month. Below the weapon count and X Power average are
            shown.
          </Trans>
        </Box> */}
        <Flex flexDir={["column", null, "row"]} justify="space-between">
          <Select
            value={`${state.month},${state.year}`}
            onChange={(e) => {
              const [month, year] = e.target.value.split(",");

              dispatch({
                type: "SET_MONTH_YEAR",
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
            mode={state.mode}
            setMode={(mode) => dispatch({ type: "SET_MODE", mode })}
            mx={["auto", null, "0"]}
            mb={[4, null, 0]}
          />
        </Flex>
        {tiers.map((tier, i) => (
          <TrendTier
            key={tier.label}
            tier={tier}
            weapons={weaponData.filter((weapon) => {
              const targetCount = 500 * (tier.criteria / 100);
              const previousTargetCount =
                i === 0 ? Infinity : 500 * (tiers[i - 1].criteria / 100);

              return (
                weapon.count >= targetCount &&
                weapon.count < previousTargetCount
              );
            })}
            getDataForChart={getDataForChart}
            mode={state.mode}
          />
        ))}
      </Page>
    </>
  );
};

export default XTrendsPage;

export const getStaticProps: GetStaticProps<XTrendsPageProps> = async () => {
  const trends = await xRankService.getXTrends();

  return { props: { trends } };
};
