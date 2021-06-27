import { Box, Flex } from "@chakra-ui/react";
import { Trans } from "@lingui/macro";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";
import { ReactNode } from "react";
import { FaGithub, FaPatreon, FaTwitter } from "react-icons/fa";
import { FiInfo } from "react-icons/fi";
import { DiscordIcon } from "utils/assets/icons";
import patrons from "utils/data/patrons.json";
import { getFullUsername } from "utils/strings";

const FooterContent: React.FC = () => {
  const { themeColorHex: themeColor } = useMyTheme();
  return (
    <Box bg={themeColor} color="black">
      <Flex
        flexDir={["column", null, "row"]}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="center"
        fontWeight="bold"
        py={2}
      >
        <ExternalLink icon={FiInfo} href="/about">
          About
        </ExternalLink>
      </Flex>
      <Flex
        flexDir={["column", null, "row"]}
        alignItems="center"
        flexWrap="wrap"
        justifyContent="center"
        fontWeight="bold"
        py={2}
      >
        <ExternalLink
          icon={FaGithub}
          href="https://github.com/Sendouc/sendou.ink"
          isExternal
        >
          View source code on Github
        </ExternalLink>
        <ExternalLink
          icon={FaTwitter}
          href="https://twitter.com/sendouink"
          isExternal
        >
          Follow @sendouink on Twitter
        </ExternalLink>
        <ExternalLink
          icon={DiscordIcon}
          href="https://discord.gg/sendou"
          isExternal
        >
          Chat on Discord
        </ExternalLink>
        <ExternalLink
          icon={FaPatreon}
          href="https://www.patreon.com/sendou"
          isExternal
        >
          Sponsor on Patreon
        </ExternalLink>
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
                fontSize={["0", "0.9rem", "1rem", "1.1rem"][patron.patreonTier]}
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

function ExternalLink({
  children,
  icon,
  href,
  isExternal,
}: {
  children: ReactNode;
  icon: any;
  href: string;
  isExternal?: boolean;
}) {
  return (
    <MyLink
      href={href}
      isExternal={isExternal}
      chakraLinkProps={{
        display: "flex",
        alignItems: "center",
        mx: 2,
        my: 2,
        color: "black",
      }}
    >
      <Box as={icon} display="inline" mr={1} size="20px" /> {children}
    </MyLink>
  );
}

export default FooterContent;
