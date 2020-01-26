import React, { useRef, useContext } from "react"
import { Box, Flex, IconButton, useDisclosure } from "@chakra-ui/core"
import Logo from "./Logo"
import { MdDehaze } from "react-icons/md"
import MobileNav from "./MobileNav"
import MyThemeContext from "../../themeContext"

export const MenuBar: React.FC = () => {
  const btnRef = useRef<HTMLElement | null>(null)

  const { isOpen, onOpen, onClose } = useDisclosure()
  const { colorMode, darkerBgColor, textColor } = useContext(MyThemeContext)
  const shadow = {
    light: "0px 1px 10px 8px rgba(0,0,0,0.15)",
    dark: "0px 1px 10px 8px rgba(255,255,255,0.04)",
  }
  return (
    <Box
      bg={darkerBgColor}
      boxShadow={shadow[colorMode]}
      as="header"
      position="fixed"
      top="0"
      zIndex={4}
      left="0"
      right="0"
      width="100%"
      height="4em"
      display={["block", null, "none"]}
    >
      <Flex size="100%" px="6" justifyContent="space-between">
        <Flex alignItems="center">
          <Logo mobile />
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
            icon={MdDehaze}
          />
        </Flex>
      </Flex>
      <MobileNav btnRef={btnRef} isOpen={isOpen} onClose={onClose} />
    </Box>
  )
}
