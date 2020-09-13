import React, { useContext } from "react"
import TopNav from "./TopNav"
import IconNavBar, { navIcons } from "./IconNavBar"
import {
  Box,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  DrawerBody,
  useDisclosure,
  IconButton,
  DrawerCloseButton,
  Image,
  Heading,
  Flex,
  Container,
} from "@chakra-ui/core"
import { FiMenu } from "react-icons/fi"
import { Link } from "@reach/router"
import MyThemeContext from "../../themeContext"
import Footer from "./Footer"

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkerBgColor, bgColor, textColor } = useContext(MyThemeContext)
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <>
      <TopNav />
      <IconNavBar />
      <Box
        color={textColor}
        bg={bgColor}
        //p={4}
        maxW="75rem"
        mx="auto"
        minH="100vh"
        //pb="20px"
      >
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
