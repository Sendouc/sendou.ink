import {
  Container,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerOverlay,
  Flex,
  Heading,
  IconButton,
  Image,
  useDisclosure,
} from "@chakra-ui/core"
import { Link, useLocation } from "@reach/router"
import React, { Suspense, useContext, useEffect } from "react"
import { FiMenu } from "react-icons/fi"
import MyThemeContext from "../../themeContext"
import Footer from "./Footer"
import IconNavBar, { navIcons } from "./IconNavBar"
import TopNav from "./TopNav"

interface LayoutProps {
  children: React.ReactNode
}

const PAGES_WITH_WIDE_CONTAINER = [
  "/analyzer",
  "/xsearch",
  "/builds",
  "/plans",
  "/xleaderboards",
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { darkerBgColor, bgColor, textColor } = useContext(MyThemeContext)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()

  useEffect(() => {
    document.body.style.backgroundColor = bgColor
  }, [bgColor])

  return (
    <>
      <TopNav />
      <Suspense fallback={null}>
        <IconNavBar />
      </Suspense>
      <Flex flexDirection="column" color={textColor} minH="100vh" pt="1rem">
        <Container
          maxWidth={
            PAGES_WITH_WIDE_CONTAINER.includes(location.pathname)
              ? "120ch"
              : "60ch"
          }
        >
          {children}
        </Container>
        <Footer />
      </Flex>

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
            {navIcons.map(({ displayName, code }) => (
              <Link key={displayName} to={code}>
                <Flex alignItems="center" my={4} onClick={onClose}>
                  <Image
                    src={`${process.env.PUBLIC_URL}/navIcons/${code}.png`}
                    h={12}
                    w={12}
                    mx={4}
                    alt={displayName}
                    cursor="pointer"
                  />
                  <Heading size="md">{displayName}</Heading>
                </Flex>
              </Link>
            ))}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  )
}

export default Layout
