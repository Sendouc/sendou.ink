import { Box, Heading, Link, Stack } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import MyHead from "components/common/MyHead";
import { CSSVariables } from "utils/CSSVariables";
import links from "utils/data/links.json";

interface Link {
  title: string;
  url: string;
  description: string;
}

const LinksPage = () => {
  const linkMap = (link: Link) => (
    <Box key={link.title}>
      <Link href={link.url} color={CSSVariables.themeColor}>
        <b>{link.title}</b>
      </Link>{" "}
      - <Box as="span">{link.description}</Box>
    </Box>
  );

  return (
    <>
      <MyHead title={t`Links`} />
      <Heading size="lg" mb="0.5em">
        <Trans>Guides</Trans>
      </Heading>
      <Stack spacing={4}>{links.guides.map(linkMap)}</Stack>
      <Heading size="lg" mt={8} mb={4}>
        YouTube
      </Heading>
      <Stack spacing={4}>{links.youtube.map(linkMap)}</Stack>
      <Heading size="lg" mt={8} mb={4}>
        Discord
      </Heading>
      <Stack spacing={4}>{links.discord.map(linkMap)}</Stack>
      <Heading size="lg" mt={8} mb={4}>
        <Trans>Misc</Trans>
      </Heading>
      <Stack spacing={4}>{links.misc.map(linkMap)}</Stack>
    </>
  );
};

export default LinksPage;
