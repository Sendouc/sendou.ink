import { Box, Flex } from "@chakra-ui/react";
import GearImage from "components/common/GearImage";
import { Unpacked } from "lib/types";
import { GetBuildsByWeaponData } from "prisma/queries/getBuildsByWeapon";
import React from "react";

interface GearsProps {
  build: Unpacked<Unpacked<GetBuildsByWeaponData>>;
}

const Gears: React.FC<GearsProps> = ({ build }) => {
  if (!build.headGear && !build.clothingGear && !build.shoesGear) {
    return <Box h="30px" />;
  }
  return (
    <Flex justifyContent="center">
      <Box w={build.headGear ? "85px" : undefined} h="85px" mx="2px">
        {build.headGear && <GearImage englishName={build.headGear} />}
      </Box>
      <Box w={build.clothingGear ? "85px" : undefined} h="85px" mx="2px">
        {build.clothingGear && <GearImage englishName={build.clothingGear} />}
      </Box>
      <Box w={build.shoesGear ? "85px" : undefined} h="85px" mx="2px">
        {build.shoesGear && <GearImage englishName={build.shoesGear} />}
      </Box>
    </Flex>
  );
};

export default Gears;
