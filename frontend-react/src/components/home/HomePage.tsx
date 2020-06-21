import React from "react"
import { RouteComponentProps } from "@reach/router"
import { Image, Heading, Flex, Box } from "@chakra-ui/core"
import { posterGirl } from "../../assets/imageImports"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import "./HomePage.css"
import { Helmet } from "react-helmet-async"
import Stats from "./Stats"
import WeeksTournaments from "./WeeksTournaments"
import { useTranslation } from "react-i18next"

const HomePage: React.FC<RouteComponentProps> = () => {
  const { colorMode, grayWithShade } = useContext(MyThemeContext)
  const { t } = useTranslation()
  return (
    <>
      <Helmet>
        <title>sendou.ink | {t("home;Competitive Splatoon Hub")}</title>
      </Helmet>
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
  )
}

export default HomePage
