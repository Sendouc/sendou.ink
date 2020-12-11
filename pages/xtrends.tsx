import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
  Select,
} from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import { useLingui } from "@lingui/react";
import Breadcrumbs from "components/common/Breadcrumbs";
import ModeSelector from "components/common/ModeSelector";
import Section from "components/common/Section";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import WeaponLineChart from "components/top500/WeaponLineChart";
import { useXTrends } from "hooks/xtrends";
import { useMyTheme } from "lib/useMyTheme";
import { GetStaticProps } from "next";
import { getXTrends, GetXTrendsData } from "prisma/queries/getXTrends";

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

interface Props {
  trends: GetXTrendsData;
}

const XTrendsPage: React.FC<Props> = ({ trends }) => {
  const { gray } = useMyTheme();
  const {
    state,
    dispatch,
    weaponData,
    getDataForChart,
    monthOptions,
  } = useXTrends(trends);

  return (
    <>
      <Breadcrumbs pages={[{ name: t`Top 500 Tier Lists` }]} />
      <Box color={gray} fontSize="sm" mb={8}>
        <Trans>
          Here you can find X Rank Top 500 usage tier lists. For example for a
          weapon to be in the X tier it needs at least 30 placements in that
          mode that month. Below the weapon count and X Power average are shown.
        </Trans>
      </Box>
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
      <ModeSelector
        mode={state.mode}
        setMode={(mode) => dispatch({ type: "SET_MODE", mode })}
      />
      {tiers.map((tier, i) => (
        <Tier
          key={tier.label}
          tier={tier}
          weapons={weaponData.filter((weapon) => {
            const targetCount = 500 * (tier.criteria / 100);
            const previousTargetCount =
              i === 0 ? Infinity : 500 * (tiers[i - 1].criteria / 100);

            return (
              weapon.count >= targetCount && weapon.count < previousTargetCount
            );
          })}
          getDataForChart={getDataForChart}
          mode={state.mode}
        />
      ))}
    </>
  );
};

function Tier({
  tier,
  weapons,
  getDataForChart,
  mode,
}: {
  tier: { label: string; criteria: number; color: string };
  weapons: {
    name: string;
    count: number;
    xPowerAverage: number;
  }[];
  mode: string;
  getDataForChart: (weapon: string) => { count: number }[];
}) {
  const { i18n } = useLingui();
  const { gray, secondaryBgColor } = useMyTheme();

  if (!weapons.length) return null;

  return (
    <Section key={tier.criteria} display="flex" my={4}>
      <Flex
        flexDir="column"
        w="80px"
        minH="100px"
        px="10px"
        borderRight="5px solid"
        borderColor={tier.color}
        marginRight="1em"
        justifyContent="center"
      >
        <Box fontSize="2em" fontWeight="bolder">
          {tier.label}
        </Box>
        <Box color={gray}>
          {tier.criteria === 0.002 ? ">0%" : `${tier.criteria}%`}
        </Box>
      </Flex>
      <Flex flexDir="row" flex={1} flexWrap="wrap" alignItems="center" py="1em">
        {weapons.map((weapon) => (
          <Popover key={weapon.name} placement="top-start" isLazy>
            <PopoverTrigger>
              <Flex m={4} cursor="pointer" flexDir="column" align="center">
                <WeaponImage name={weapon.name} size={64} />
                <SubText mt={2}>
                  {weapon.count} / {weapon.xPowerAverage.toFixed(1)}
                </SubText>
              </Flex>
            </PopoverTrigger>
            <PopoverContent zIndex={4} p="0.5em" bg={secondaryBgColor}>
              <PopoverArrow bg={secondaryBgColor} />
              <Flex flexDir="column" alignItems="center">
                <Box
                  as="span"
                  fontWeight="bolder"
                  fontSize="1.2em"
                  mb="0.5em"
                  textAlign="center"
                >
                  {i18n._(weapon.name)}
                  <SubText>{i18n._(mode)}</SubText>
                </Box>
                <WeaponLineChart
                  getDataForChart={() => getDataForChart(weapon.name)}
                />
              </Flex>
            </PopoverContent>
          </Popover>
        ))}
      </Flex>
    </Section>
  );
}

export const getStaticProps: GetStaticProps<Props> = async () => {
  const trends = await getXTrends();

  return { props: { trends } };
};

export default XTrendsPage;
