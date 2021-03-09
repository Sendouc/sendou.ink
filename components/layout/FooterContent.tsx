import { Box, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import Link from "next/link";
import { FaGithub, FaTwitter } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { DiscordIcon } from "utils/assets/icons";
import patrons from "utils/data/patrons.json";
import { getFullUsername } from "utils/strings";

const FooterContent: React.FC = () => {
  const { themeColorHex: themeColor } = useMyTheme();
  return (
    <Box bg={themeColor} color="black">
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
      <Box p={3} textAlign="center">
        <Box fontWeight="bold">
          <Trans>Thanks to the patrons for their support ❤</Trans>
        </Box>
        <Flex flexWrap="wrap" justify="center" align="center" mt={2}>
          {patrons.map((patron) => (
            <MyLink
              key={patron.discordId}
              href={`/u/${patron.discordId}`}
              isColored={false}
            >
              <Box
                fontSize={
                  ["0", "0.9rem", "1rem", "1.25rem"][patron.patreonTier]
                }
                mx={1}
              >
                {getFullUsername(patron)}
              </Box>
            </MyLink>
          ))}
        </Flex>
      </Box>
    </Box>
  );
};

export default FooterContent;
