import { Box, Flex, IconButton, useDisclosure } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext, useRef } from "react"
import { MdDehaze } from "react-icons/md"
import MyThemeContext from "../../themeContext"
import Logo from "./Logo"
import MobileNav from "./MobileNav"

export const MenuBar: React.FC = () => {
  const btnRef = useRef<HTMLButtonElement | null>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const {
    darkerBgColor,
    textColor,
    colorMode,
    themeColorHex,
    themeColorHexLighter,
  } = useContext(MyThemeContext)
  return (
    <Box
      bg={darkerBgColor}
      as="header"
      borderBottom="2px solid"
      borderColor={colorMode === "light" ? themeColorHex : themeColorHexLighter}
      position="fixed"
      top="0"
      zIndex={4}
      left="0"
      right="0"
      width="100%"
      height="4em"
      display={["block", null, "none"]}
    >
      <Flex h="100%" w="100%" px="6" justifyContent="space-between">
        <Flex alignItems="center">
          <Link to="/">
            <Logo mobile />
          </Link>
        </Flex>
        <Flex alignItems="center" color="gray.500" justify="flex-end">
          <IconButton
            aria-label="Open menu"
            ref={btnRef}
            variant="ghost"
            color={textColor}
            ml="2"
            fontSize="35px"
            onClick={onOpen}
            icon={<MdDehaze />}
          />
        </Flex>
      </Flex>
      <MobileNav btnRef={btnRef} isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
