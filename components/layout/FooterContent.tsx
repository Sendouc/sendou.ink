import { Box, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import { DiscordIcon } from "lib/assets/icons";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";

const FooterContent: React.FC = () => {
  const { themeColorHex: themeColor } = useMyTheme();
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
          <Link href="/about">
            <Trans>About</Trans>
          </Link>
        </Box>
        <Link href="/links">
          <Trans>External links</Trans>
        </Link>
      </Flex>
      <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
        <a href="https://discord.gg/sendou">
          <DiscordIcon h="50px" w="50px" m="1em" />
        </a>
        <a href="https://github.com/Sendouc/sendou.ink">
          <Box as={FaGithub} size="50px" m="1em" />
        </a>
      </Flex>
    </Flex>
  );
};

export default FooterContent;
