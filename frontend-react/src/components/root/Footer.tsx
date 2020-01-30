import React, { useContext } from "react"
import { Box, Flex, Heading, IconButton, Link } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import {
  FaTwitter,
  FaGithub,
  FaYoutube,
  FaDiscord,
  FaTwitch,
} from "react-icons/fa"

const ICON_SIZE = "lg"

const Footer: React.FC = () => {
  const {
    themeColorWithShade,
    colorMode,
    darkerBgColor,
    themeColor,
  } = useContext(MyThemeContext)
  const buttonColor =
    colorMode === "light" ? `${themeColor}.200` : `${themeColor}.500`
  return (
    <Box mt="2em">
      <Link href="https://discord.gg/J6NqUvt" mx="1em">
        <IconButton
          isRound
          variant="ghost"
          //bg={buttonColor}
          icon={FaDiscord}
          aria-label="Link to Discord"
          size={ICON_SIZE}
        />
      </Link>
      <Link href="https://twitter.com/sendouc" mx="1em">
        <IconButton
          isRound
          variant="ghost"
          //bg={buttonColor}
          icon={FaTwitter}
          aria-label="Link to Twitter"
          size={ICON_SIZE}
        />
      </Link>
      <Link href="https://www.twitch.tv/sendou" mx="1em">
        <IconButton
          isRound
          variant="ghost"
          //bg={buttonColor}
          icon={FaTwitch}
          aria-label="Link to Twitch"
          size={ICON_SIZE}
        />
      </Link>
      <Link href="https://github.com/Sendouc/sendou-ink" mx="1em">
        <IconButton
          isRound
          variant="ghost"
          //bg={buttonColor}
          icon={FaGithub}
          aria-label="Link to Github"
          size={ICON_SIZE}
        />
      </Link>
      <Flex
        bg={themeColorWithShade}
        p="25px"
        flexShrink={0}
        borderRadius="5px"
        alignItems="center"
        fontWeight="bold"
        letterSpacing="1px"
      >
        <Link mx="2em" color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}>
          About
        </Link>
        <Link mx="2em" color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}>
          Thanks to
        </Link>
        <Link mx="2em" color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}>
          External links
        </Link>
      </Flex>
    </Box>
  )
}

export default Footer
