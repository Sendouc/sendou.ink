import { Box, Flex } from "@chakra-ui/react";
import { DiscordIcon } from "lib/assets/icons";
import { useMyTheme } from "lib/useMyTheme";
import Link from "next/link";
import { FaGithub } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";

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
      <Flex alignItems="center" flexWrap="wrap" justifyContent="center">
        <Link href="/about">
          <a>
            <Box as={FiInfo} size="50px" m="1em" />
          </a>
        </Link>
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
