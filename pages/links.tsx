import { Box, Heading, Link, Stack } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import Breadcrumbs from "components/common/Breadcrumbs";
import MyHead from "components/common/MyHead";
import links from "lib/data/links.json";
import { useMyTheme } from "lib/useMyTheme";

interface Link {
  title: string;
  url: string;
  description: string;
}

const LinksPage = () => {
  const { themeColorShade } = useMyTheme();

  const linkMap = (link: Link) => (
    <Box key={link.title}>
      <Link href={link.url} color={themeColorShade}>
        <b>{link.title}</b>
      </Link>{" "}
      - <Box as="span">{link.description}</Box>
    </Box>
  );

  return (
    <>
      <MyHead title={t`Links`} />
      <Breadcrumbs pages={[{ name: t`Links` }]} />
      <Heading size="lg" my="0.5em" mt="1em">
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
