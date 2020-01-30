import React, { useContext } from "react"
import { Box, Flex, IconButton, Link, Image } from "@chakra-ui/core"
import { footerSquid, footerOcto } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { FaTwitter, FaGithub, FaDiscord, FaTwitch } from "react-icons/fa"

const ICON_SIZE = "lg"

const Footer: React.FC = () => {
  const { themeColorWithShade, colorMode } = useContext(MyThemeContext)

  return (
    <Box mt="2em">
      <Flex alignItems="flex-end">
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
        <Image
          src={
            Math.random() > 0.5 ? footerSquid[colorMode] : footerOcto[colorMode]
          }
          bg={themeColorWithShade}
          w="80px"
          h="auto"
          ml="auto"
          mr="50px"
          userSelect="none"
        />
      </Flex>
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
