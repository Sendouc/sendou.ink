import { Box, Flex, Icon, Image } from "@chakra-ui/core"
import { Link } from "@reach/router"
import React, { useContext, useState, Suspense } from "react"
import { FaGithub, FaTwitch, FaTwitter } from "react-icons/fa"
import { footerOcto, footerSquid } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import { useTranslation } from "react-i18next"
import FooterContent from "./FooterContent"

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
      <Suspense fallback={null}>
        <FooterContent />
      </Suspense>
    </Box>
  )
}

export default Footer
