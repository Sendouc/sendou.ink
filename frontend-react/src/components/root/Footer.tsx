import { Box, Image } from "@chakra-ui/core"
import React, { Suspense, useContext, useState } from "react"
import { footerOcto, footerSquid } from "../../assets/imageImports"
import MyThemeContext from "../../themeContext"
import FooterContent from "./FooterContent"
import { FooterWaves } from "./FooterWaves"

const Footer: React.FC = () => {
  const [footerBojoing] = useState(
    Math.random() > 0.5 ? footerSquid : footerOcto
  )
  const { themeColorWithShade, colorMode } = useContext(MyThemeContext)

  return (
    <Box mt="auto">
      <Image
        src={footerBojoing[colorMode]}
        bg={themeColorWithShade}
        w="80px"
        ml="auto"
        mr="35%"
        mb="-5%"
        mt="5rem"
        userSelect="none"
        loading="lazy"
      />
      <FooterWaves />
      <Suspense fallback={null}>
        <FooterContent />
      </Suspense>
    </Box>
  )

  return (
    <Box mt="auto">
      <Box display="flex" alignItems="flex-end">
        <Image
          src={footerBojoing[colorMode]}
          bg={themeColorWithShade}
          w="80px"
          h="auto"
          ml="auto"
          mr="50px"
          userSelect="none"
          loading="lazy"
        />
      </Box>
      <Suspense fallback={null}>
        <FooterContent />
      </Suspense>
    </Box>
  )
}

export default Footer
