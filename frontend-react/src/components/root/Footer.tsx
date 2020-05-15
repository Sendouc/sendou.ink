import { Box, Flex, Icon, Image } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext, useState } from "react"
import { FaGithub, FaTwitch, FaTwitter } from "react-icons/fa"
import { footerOcto, footerSquid } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"

const Footer: React.FC = () => {
  const [footerBojoing] = useState(
    Math.random() > 0.5 ? footerSquid : footerOcto
  )
  const { themeColorWithShade, colorMode } = useContext(MyThemeContext)

  return (
    <Box mt="2em" color={colorMode === "light" ? "white" : "black"}>
      <Box display="flex" alignItems="flex-end">
        <Image
          src={footerBojoing[colorMode]}
          bg={themeColorWithShade}
          w="80px"
          h="auto"
          ml="auto"
          mr="50px"
          userSelect="none"
        />
      </Box>
      <Flex
        bg={themeColorWithShade}
        p="25px"
        flexShrink={0}
        borderRadius="5px"
        alignItems="center"
        fontWeight="bold"
        letterSpacing="1px"
        flexWrap="wrap"
        justifyContent="space-between"
      >
        <Flex flexWrap="wrap" justifyContent="space-between">
          <Box mr="1em">
            <Link to="/about">About</Link>
          </Box>
          <Link to="/links">External links</Link>
        </Flex>
        <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
          <a href="https://discord.gg/J6NqUvt">
            <Icon name={"discord" as string} size="30px" m="1em" />
          </a>
          <a href="https://twitter.com/sendouc">
            <Box as={FaTwitter} size="30px" m="1em" />
          </a>
          <a href="https://www.twitch.tv/sendou">
            <Box as={FaTwitch} size="30px" m="1em" />
          </a>
          <a href="https://github.com/Sendouc/sendou-ink">
            <Box as={FaGithub} size="30px" m="1em" />
          </a>
        </Flex>
      </Flex>
    </Box>
  )
}

export default Footer
