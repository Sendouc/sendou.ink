import {
  Box,
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  IconButton,
  useDisclosure,
} from "@chakra-ui/core"
import React, { useContext, useEffect } from "react"
import { FiMenu } from "react-icons/fi"
import MyThemeContext from "../../themeContext"
import Footer from "./Footer"
import IconNavBar from "./IconNavBar"
import TopNav from "./TopNav"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const {
    darkerBgColor,
    bgColor,
    textColor,
    colorMode,
    themeColorHex,
    themeColorHexLighter,
    themeColorWithShade,
  } = useContext(MyThemeContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  useEffect(() => {
    document.body.style.backgroundColor = bgColor
  }, [bgColor])

  return (
    <>
      <TopNav />
      <IconNavBar />
      <Box color={textColor} minH="100vh" pt="1rem">
        <Container maxWidth="80ch">{children}</Container>
        <Footer />
      </Box>

      <IconButton
        aria-label="Open menu"
        onClick={onOpen}
        icon={<FiMenu />}
        position="fixed"
        bottom={0}
        right={0}
        isRound
        m={4}
        size="lg"
        display={["flex", null, "none"]}
        boxShadow="0px 0px 16px 6px rgba(0,0,0,0.1)"
      >
        Open
      </IconButton>
      <Drawer onClose={onClose} isOpen={isOpen} size="xs">
        <DrawerOverlay />
        <DrawerContent bg={darkerBgColor}>
          <DrawerCloseButton />
          <DrawerBody>
            {/*navIcons.map(({ name, displayName }) => (
              <Link key={name} to={name}>
                <Flex alignItems="center" my={4} onClick={onClose}>
                  <Image
                    src={`/images/navIcons/${name}.webp`}
                    fallbackSrc={`/images/navIcons/${name}.png`}
                    h={12}
                    w={12}
                    mx={4}
                    alt={name}
                    cursor="pointer"
                  />
                  <Heading size="md">{displayName}</Heading>
                </Flex>
              </Link>
            ))*/}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Layout
