import React, { useState, useContext } from "react"
import { Box, Flex, IconButton, Link, Image } from "@chakra-ui/core"
import { footerSquid, footerOcto } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { FaTwitter, FaGithub, FaDiscord, FaTwitch } from "react-icons/fa"
import useBreakPoints from "../../hooks/useBreakPoints"

const ICON_SIZE = "lg"

const Footer: React.FC = () => {
  const [footerBojoing] = useState(0.5 ? footerSquid : footerOcto)
  const { themeColorWithShade, colorMode } = useContext(MyThemeContext)
  const isSmall = useBreakPoints(480)

  return (
    <Box mt="2em">
      <Flex alignItems="flex-end">
        <Link href="https://discord.gg/J6NqUvt" mx="1em">
          <IconButton
            variant="ghost"
            icon={FaDiscord}
            aria-label="Link to Discord"
            size={ICON_SIZE}
            display={isSmall ? "none" : undefined}
          />
        </Link>
        <Link href="https://twitter.com/sendouc" mx="1em">
          <IconButton
            variant="ghost"
            icon={FaTwitter}
            aria-label="Link to Twitter"
            size={ICON_SIZE}
            display={isSmall ? "none" : undefined}
          />
        </Link>
        <Link href="https://www.twitch.tv/sendou" mx="1em">
          <IconButton
            variant="ghost"
            icon={FaTwitch}
            aria-label="Link to Twitch"
            size={ICON_SIZE}
            display={isSmall ? "none" : undefined}
          />
        </Link>
        <Link href="https://github.com/Sendouc/sendou-ink" mx="1em">
          <IconButton
            variant="ghost"
            icon={FaGithub}
            aria-label="Link to Github"
            size={ICON_SIZE}
            display={isSmall ? "none" : undefined}
          />
        </Link>
        <Image
          src={footerBojoing[colorMode]}
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
        flexWrap="wrap"
        justifyContent={isSmall ? "center" : undefined}
      >
        {isSmall && (
          <Flex
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
          </Flex>
        )}
        <Link
          mx="2em"
          my="1em"
          color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}
        >
          About
        </Link>
        <Link
          mx="2em"
          my="1em"
          color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}
        >
          Thanks to
        </Link>
        <Link
          mx="2em"
          my="1em"
          color={colorMode === "light" ? "#fffffe" : "#0d0d0d"}
        >
          External links
        </Link>
      </Flex>
    </Box>
  )
}

export default Footer
