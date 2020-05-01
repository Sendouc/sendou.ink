import React, { useState, useContext } from "react"
import { Link, Image, Box, Flex } from "@chakra-ui/core"
import { Link as ReachLink } from "@reach/router"
import { footerSquid, footerOcto } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { FaTwitter, FaGithub, FaDiscord, FaTwitch } from "react-icons/fa"
import useBreakPoints from "../../hooks/useBreakPoints"
import IconButton from "../elements/IconButton"

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
          <Link href="/about">
            <a style={{ marginRight: "1em" }}>About</a>
          </Link>
          <Link href="/links">
            <a>External links</a>
          </Link>
        </Flex>
        <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
          <a href="https://discord.gg/J6NqUvt">
            <Box as={FaDiscord} size="30px" m="1em" />
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
