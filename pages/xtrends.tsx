import { Flex, Select } from "@chakra-ui/react";
import xRankService, { XTrends } from "app/xrank/service";
import ModeSelector from "components/common/ModeSelector";
import MyHead from "components/common/MyHead";
import Page from "components/common/Page";
import TrendTier from "components/xtrends/TrendTier";
import { useXTrends } from "hooks/xtrends";
import { GetStaticProps } from "next";
import { xTrendsTiers } from "utils/constants";

export interface XTrendsPageProps {
  trends: XTrends;
}

const XTrendsPage = ({ trends }: XTrendsPageProps) => {
  const { state, dispatch, weaponData, monthOptions } = useXTrends(trends);

  return (
    <>
      <MyHead title="Top 500 Trends" />
      <Page>
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
        {xTrendsTiers.map((tier, i) => (
          <TrendTier
            key={tier.label}
            tier={tier}
            weapons={weaponData.filter((weapon) => {
              const targetCount = 500 * (tier.criteria / 100);
              const previousTargetCount =
                i === 0 ? Infinity : 500 * (xTrendsTiers[i - 1].criteria / 100);

              return (
                weapon.count >= targetCount &&
                weapon.count < previousTargetCount
              );
            })}
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
