import { Box, Flex } from "@chakra-ui/react";
import { useMyTheme } from "hooks/common";
import Link from "next/link";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { DiscordIcon } from "utils/assets/icons";

const FooterContent: React.FC = () => {
  const { themeColorHex: themeColor } = useMyTheme();
  return (
    <Flex
      mt="-1px"
      pt={4}
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
        <a href="https://twitter.com/sendouink">
          <Box as={FaTwitter} size="50px" m="1em" />
        </a>
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
