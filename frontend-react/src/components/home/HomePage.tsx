import React from "react"
import { RouteComponentProps } from "@reach/router"
import { Image, Heading, Flex } from "@chakra-ui/core"
import { posterGirl } from "../../assets/imageImports"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import "./HomePage.css"

const HomePage: React.FC<RouteComponentProps> = ({}) => {
  const { colorMode, grayWithShade } = useContext(MyThemeContext)
  return (
    <>
      <Flex
        flexDirection="column"
        alignItems="center"
        title="Picture by borzoic (@borzoic_ on Twitter)"
      >
        <Image className="rgb" src={posterGirl[colorMode]} w="40vw" h="auto" />
        <Heading
          letterSpacing="1px"
          fontFamily="'Pacifico', cursive"
          fontSize="7vw"
          fontWeight="light"
        >
          Sendou.ink
        </Heading>
        <Heading
          letterSpacing="1px"
          fontWeight="light"
          fontSize="2vw"
          color={grayWithShade}
        >
          Competitive Splatoon Hub
        </Heading>
      </Flex>
    </>
  )
}

export default HomePage
