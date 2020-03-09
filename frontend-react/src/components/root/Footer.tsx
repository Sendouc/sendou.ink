import React, { useState, useContext } from "react"
import { Link, Image } from "@chakra-ui/core"
import { Link as ReachLink } from "@reach/router"
import { footerSquid, footerOcto } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { FaTwitter, FaGithub, FaDiscord, FaTwitch } from "react-icons/fa"
import useBreakPoints from "../../hooks/useBreakPoints"
import Box from "../elements/Box"
import IconButton from "../elements/IconButton"

const Footer: React.FC = () => {
  const [footerBojoing] = useState(0.5 ? footerSquid : footerOcto)
  const { themeColorWithShade, colorMode } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(480)

  return (
    <Box mt="2em">
      <Box display="flex" alignItems="flex-end">
        {!isSmall && (
          <>
            <Link href="https://discord.gg/J6NqUvt" mx="1em">
              <IconButton icon={FaDiscord} aria-label="Link to Discord" />
            </Link>
            <Link href="https://twitter.com/sendouc" mx="1em">
              <IconButton icon={FaTwitter} aria-label="Link to Twitter" />
            </Link>
            <Link href="https://www.twitch.tv/sendou" mx="1em">
              <IconButton icon={FaTwitch} aria-label="Link to Twitch" />
            </Link>
            <Link href="https://github.com/Sendouc/sendou-ink" mx="1em">
              <IconButton icon={FaGithub} aria-label="Link to Github" />
            </Link>
          </>
        )}
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
      <Box
        display="flex"
        bg={themeColorWithShade}
        p="25px"
        flexShrink={0}
        borderRadius="5px"
        alignItems="center"
        fontWeight="bold"
        letterSpacing="1px"
        flexWrap="wrap"
        justifyContent={isSmall ? "center" : undefined}
      >
        {isSmall && (
          <Box
            display="flex"
            alignItems="center"
            flexWrap="wrap"
            justifyContent="center"
            color="black"
          >
            <Link href="https://discord.gg/J6NqUvt" m="1em">
              <Box as={FaDiscord} size="50px" />
            </Link>
            <Link href="https://twitter.com/sendouc" m="1em">
              <Box as={FaTwitter} size="50px" />
            </Link>
            <Link href="https://www.twitch.tv/sendou" m="1em">
              <Box as={FaTwitch} size="50px" />
            </Link>
            <Link href="https://github.com/Sendouc/sendou-ink" m="1em">
              <Box as={FaGithub} size="50px" />
            </Link>
          </Box>
        )}
        <ReachLink to="/about">
          <Box
            mx="2em"
            my="1em"
            color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}
          >
            About
          </Box>
        </ReachLink>
        <ReachLink to="/links">
          <Box
            mx="2em"
            my="1em"
            color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}
          >
            External links
          </Box>
        </ReachLink>
      </Box>
    </Box>
  )
}

export default Footer
