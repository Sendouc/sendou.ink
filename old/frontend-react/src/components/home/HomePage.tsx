import { Box, Button, Flex, Heading, Image } from "@chakra-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { posterGirl } from "../../assets/imageImports";
import MyThemeContext from "../../themeContext";
import "./HomePage.css";
import Stats from "./Stats";
import WeeksTournaments from "./WeeksTournaments";

const HomePage: React.FC<RouteComponentProps> = () => {
  const { colorMode, grayWithShade } = useContext(MyThemeContext);
  const { t } = useTranslation();
  return (
    <>
      <Helmet>
        <title>sendou.ink | {t("home;Competitive Splatoon Hub")}</title>
      </Helmet>
      <Button>asd</Button>
      <Flex flexDirection="column" alignItems="center" mb="1.5em">
        <Image className="rgb" src={posterGirl[colorMode]} w="400px" h="auto" />
        <Heading
          letterSpacing="1px"
          fontFamily="'Rubik', sans-serif"
          fontWeight="bold"
        >
          Sendou.ink
        </Heading>

        <Heading
          size="md"
          letterSpacing="1px"
          fontWeight="light"
          color={grayWithShade}
        >
          {t("home;Competitive Splatoon Hub")}
        </Heading>
        <Stats />
      </Flex>
      <Box mt="2em">
        <WeeksTournaments />
      </Box>
    </>
  );
};

export default HomePage;
