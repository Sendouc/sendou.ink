import { Box, Flex } from "@chakra-ui/react";
import OutlinedBox from "components/common/OutlinedBox";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import { useMyTheme } from "hooks/common";

const TrendTier = ({
  tier,
  weapons,
}: {
  tier: { label: string; criteria: number; color: string };
  weapons: {
    name: string;
    count: number;
    xPowerAverage: number;
  }[];
}) => {
  const { gray } = useMyTheme();

  if (!weapons.length) return null;

  return (
    <OutlinedBox key={tier.label} mb={4}>
      <Flex>
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
        <Flex
          flexDir="row"
          flex={1}
          flexWrap="wrap"
          alignItems="center"
          py="1em"
        >
          {weapons.map((weapon) => (
            <Flex
              key={weapon.name}
              m={4}
              cursor="pointer"
              flexDir="column"
              align="center"
            >
              <WeaponImage name={weapon.name} size={64} />
              <SubText mt={2}>
                {weapon.count} / {weapon.xPowerAverage.toFixed(1)}
              </SubText>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </OutlinedBox>
  );
};

export default TrendTier;
