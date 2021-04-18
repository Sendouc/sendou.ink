import { Box, Flex } from "@chakra-ui/react";
import { XTrends } from "app/xrank/service";
import OutlinedBox from "components/common/OutlinedBox";
import SubText from "components/common/SubText";
import WeaponImage from "components/common/WeaponImage";
import { useMyTheme } from "hooks/common";
import { IoChevronDownOutline, IoChevronUpOutline } from "react-icons/io5";

const TrendTier = ({
  tier,
  data,
}: {
  tier: { label: string; criteria: number; color: string };
  data: XTrends["SZ"];
}) => {
  const { gray } = useMyTheme();

  if (!data.length) return null;

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
          {data.map((weaponObj) => (
            <Flex key={weaponObj.weapon} m={4} flexDir="column" align="center">
              <WeaponImage name={weaponObj.weapon} size={64} />
              <SubText display="flex" alignItems="center" mt={2}>
                {weaponObj.count} / {weaponObj.averageXp} /{" "}
                {
                  {
                    UP: (
                      <Box
                        fontSize="lg"
                        color="green.500"
                        as={IoChevronUpOutline}
                      />
                    ),
                    SAME: (
                      <Box fontSize="3xl" color="gray.500" mb={1}>
                        -
                      </Box>
                    ),
                    DOWN: (
                      <Box
                        fontSize="lg"
                        color="red.500"
                        as={IoChevronDownOutline}
                      />
                    ),
                  }[weaponObj.progress]
                }
              </SubText>
            </Flex>
          ))}
        </Flex>
      </Flex>
    </OutlinedBox>
  );
};

export default TrendTier;
