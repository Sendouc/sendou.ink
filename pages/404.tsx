import { Box, Flex, Heading, Image } from "@chakra-ui/react";
import { CSSVariables } from "utils/CSSVariables";

const splatoonOneMaps = [
  {
    image: "alfonsino",
    name: "Museum D'Alfonsino",
  },
  {
    image: "bluefin",
    name: "Bluefin Depot",
  },
  {
    image: "bridge",
    name: "Hammerhead Bridge",
  },
  {
    image: "flounder",
    name: "Flounder Heights",
  },
  {
    image: "resort",
    name: "Mahi-Mahi Resort",
  },
  {
    image: "rig",
    name: "Saltspray Rig",
  },
  {
    image: "underpass",
    name: "Urchin Underpass",
  },
] as const;

const NotFound = () => {
  const mapObject =
    splatoonOneMaps[Math.floor(Math.random() * splatoonOneMaps.length)];
  return (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Image
        src={`/splatoon1Maps/${mapObject.image}.png`}
        borderRadius="5px"
        w="500px"
        h="auto"
        my={4}
        alt=""
      />
      <Heading>404 - Not Found</Heading>
      <Box color={CSSVariables.themeGray}>
        ...just like {mapObject.name} can&apos;t be found in Splatoon 2
      </Box>
    </Flex>
  );
};

export default NotFound;
