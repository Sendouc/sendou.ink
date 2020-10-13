import React, { useContext } from "react";
import { RouteComponentProps } from "@reach/router";
import { Splatoon1Maps } from "../../assets/imageImports";
import { choose } from "../../utils/helperFunctions";
import { Image, Flex, Heading, Box } from "@chakra-ui/core";
import MyThemeContext from "../../themeContext";

const NotFound: React.FC<RouteComponentProps> = () => {
  const { grayWithShade } = useContext(MyThemeContext);
  const mapObject = choose(Splatoon1Maps);
  return (
    <Flex flexDirection="column" justifyContent="center" alignItems="center">
      <Image src={mapObject.image} borderRadius="5px" w="500px" h="auto" />
      <Heading mt="1em">404 - Not Found</Heading>
      <Box color={grayWithShade}>
        ...just like {mapObject.name} can't be found in Splatoon 2
      </Box>
    </Flex>
  );
};

export default NotFound;
