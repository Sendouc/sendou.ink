import React from "react"
import { RouteComponentProps } from "@reach/router"
import { Image, Heading, Flex } from "@chakra-ui/core"
import { posterGirl } from "../../assets/imageImports"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import "./HomePage.css"
import { Helmet } from "react-helmet-async"
import Stats from "./Stats"
import WeeksTournaments from "./WeeksTournaments"

const HomePage: React.FC<RouteComponentProps> = () => {
  const { colorMode, grayWithShade } = useContext(MyThemeContext)
  return (
    <>
      <Helmet>
        <title>sendou.ink | Competitive Splatoon Hub</title>
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
          Competitive Splatoon Hub
        </Heading>
        <Stats />
      </Flex>
      <WeeksTournaments />
    </>
  )
}

export default HomePage
