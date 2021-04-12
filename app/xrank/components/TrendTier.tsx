import {
  Box,
  Flex,
  Popover,
  PopoverArrow,
  PopoverContent,
  PopoverTrigger,
} from "@chakra-ui/react";
import { useLingui } from "@lingui/react";
import WeaponLineChart from "app/xrank/components/WeaponLineChart";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import { useMyTheme } from "hooks/common";

const TrendTier = ({
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
}) => {
  const { i18n } = useLingui();
  const { gray, secondaryBgColor } = useMyTheme();

  if (!weapons.length) return null;

  return (
    <Flex key={tier.criteria}>
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
    </Flex>
  );
};

export default TrendTier;
