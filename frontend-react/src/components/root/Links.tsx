import { Box, Heading, Link, Stack } from "@chakra-ui/core";
import { RouteComponentProps } from "@reach/router";
import React, { useContext } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import MyThemeContext from "../../themeContext";
import PageHeader from "../common/PageHeader";
import Alert from "../elements/Alert";
import links from "./links.json";

interface LinkI {
  title: string;
  url: string;
  description: string;
}

const Links: React.FC<RouteComponentProps> = () => {
  const { t, i18n } = useTranslation();
  const { themeColorWithShade, grayWithShade } = useContext(MyThemeContext);

  const linkMap = (link: LinkI) => (
    <Box key={link.title}>
      <Link href={link.url} color={themeColorWithShade}>
        <b>{link.title}</b>
      </Link>{" "}
      -{" "}
      <Box as="span" color={grayWithShade}>
        {link.description}
      </Box>
    </Box>
  );

  return (
    <>
      <Helmet>
        <title>{t("footer;Links")} | sendou.ink</title>
      </Helmet>
      <PageHeader title="Links" />
      {i18n.language !== "en" && (
        <Alert status="info">{t("footer;englishOnly")}</Alert>
      )}
      <Heading size="lg" my="0.5em" fontFamily="'Rubik', sans-serif" mt="1em">
        {t("footer;Guides")}
      </Heading>
      <Stack spacing={4}>{links.guides.map(linkMap)}</Stack>
      <Heading size="lg" my="0.5em" fontFamily="'Rubik', sans-serif">
        {t("footer;Discord")}
      </Heading>
      <Stack spacing={4}>{links.discord.map(linkMap)}</Stack>
      <Heading size="lg" my="0.5em" fontFamily="'Rubik', sans-serif">
        {t("footer;Misc")}
      </Heading>
      <Stack spacing={4}>{links.misc.map(linkMap)}</Stack>
    </>
  );
};

export default Links;
