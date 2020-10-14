import { Box, Flex } from "@chakra-ui/core";
import { DiscordIcon } from "assets/icons";
import { useTranslation } from "lib/useMockT";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const FooterContent: React.FC = () => {
  const { t } = useTranslation();
  const { themeColor } = useMyTheme();
  return (
    <Flex
      pb="50px"
      flexShrink={0}
      alignItems="center"
      fontWeight="bold"
      letterSpacing="1px"
      flexWrap="wrap"
      justifyContent="space-evenly"
      bg={themeColor}
      color="black"
    >
      <Flex flexDirection="column" fontSize="1.2rem">
        <Box my="1em">
          <Link href="/about">{t("footer;About")}</Link>
        </Box>
        <Link href="/links">{t("footer;External links")}</Link>
      </Flex>
      <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
        <a href="https://discord.gg/sendou">
          <DiscordIcon h="30px" w="30px" m="1em" />
        </a>
        <a href="https://github.com/Sendouc/sendou.ink">
          <Box as={FaGithub} size="30px" m="1em" />
        </a>
      </Flex>
    </Flex>
  );
};

export default FooterContent;
