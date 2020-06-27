import React, { useContext } from "react"
import { Flex, Box, Icon } from "@chakra-ui/core"
import { useTranslation } from "react-i18next"
import { Link } from "@reach/router"
import { FaGithub } from "react-icons/fa"
import MyThemeContext from "../../themeContext"

const FooterContent: React.FC = () => {
  const { t } = useTranslation()
  const { themeColorWithShade } = useContext(MyThemeContext)
  return (
    <Flex
      bg={themeColorWithShade}
      p="25px"
      flexShrink={0}
      borderRadius="5px"
      alignItems="center"
      fontWeight="bold"
      letterSpacing="1px"
      flexWrap="wrap"
      justifyContent="space-between"
    >
      <Flex flexWrap="wrap" justifyContent="space-between">
        <Box mr="1em">
          <Link to="/about">{t("footer;About")}</Link>
        </Box>
        <Link to="/links">{t("footer;External links")}</Link>
      </Flex>
      <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
        <a href="https://discord.gg/J6NqUvt">
          <Icon name={"discord" as string} size="30px" m="1em" />
        </a>
        <a href="https://github.com/Sendouc/sendou-ink">
          <Box as={FaGithub} size="30px" m="1em" />
        </a>
      </Flex>
    </Flex>
  )
}

export default FooterContent
