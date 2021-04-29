import { Heading, Link, List, ListItem } from "@chakra-ui/react";
import { t, Trans } from "@lingui/macro";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";
import { useMyTheme } from "hooks/common";

const About = () => {
  const { themeColorShade } = useMyTheme();
  return (
    <>
      <MyHead title={t`About`} />
      <div style={{ marginBottom: "1em" }}>
        This site was made by{" "}
        <MyLink isExternal href="https://sendou.cc/">
          Sendou
        </MyLink>{" "}
        with help from the people below.
      </div>
      <div style={{ marginTop: "1em" }}>
        <Heading size="lg" mb="0.5em">
          <Trans>Thanks to</Trans>
        </Heading>
        <ul style={{ marginLeft: "1.2em", marginTop: "0.5em" }}>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/LeanYoshi"
            >
              Lean
            </Link>{" "}
            - <Trans>provided the data for Top 500 X Rank and League</Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/zorg_z0rg_z0r8"
            >
              zorg
            </Link>{" "}
            -{" "}
            <Trans>
              provided background pictures of 4v4 maps for the map planner
            </Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/ganbawoomy"
            >
              ganbawoomy
            </Link>{" "}
            - <Trans>provided the data for tournament browser</Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/noaim_brn"
            >
              NoAim™bUrn
            </Link>{" "}
            - <Trans>gave plenty of useful feedback</Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/borzoic_"
            >
              borzoic
            </Link>{" "}
            -{" "}
            <Trans>
              art for the site - front page inkling, icons and footer drawing
            </Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/DblCookies"
            >
              DblCookies
            </Link>{" "}
            -{" "}
            <Trans>
              <MyLink
                isExternal
                href="https://github.com/Sendouc/sendou.ink/pulls?q=is%3Apr+is%3Amerged+author%3ADoubleCookies+"
              >
                <Trans>Contributions to the codebase</Trans>
              </MyLink>
            </Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/rofreg"
            >
              Ryan Laughlin
            </Link>{" "}
            -{" "}
            <Trans>
              <MyLink
                isExternal
                href="https://github.com/Sendouc/sendou.ink/pulls?q=is%3Apr+is%3Aclosed+author%3Arofreg+"
              >
                <Trans>Contributions to the codebase</Trans>
              </MyLink>
            </Trans>
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/Yuza_i"
            >
              yuza
            </Link>{" "}
            - <Trans>translation</Trans> (Deutsch)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/spookyporo"
            >
              naga
            </Link>{" "}
            - <Trans>translation</Trans> (Español (España))
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/Grey_spl"
            >
              Grey
            </Link>{" "}
            - <Trans>translation</Trans> (Français)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/DatPretto"
            >
              Pretto
            </Link>{" "}
            - <Trans>translation</Trans> (Italiano)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/VoltoMatte"
            >
              Volto
            </Link>{" "}
            - <Trans>translation</Trans> (Italiano)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/Guigas_Jr"
            >
              Guigas
            </Link>{" "}
            - <Trans>translation</Trans> (Português)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/Walavouchey"
            >
              Walavouchey
            </Link>{" "}
            - <Trans>translation</Trans> (Svenska)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/sp9rK_spl"
            >
              sp9rK
            </Link>{" "}
            - <Trans>translation</Trans> (Ελληνικά)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/V_CH3RRY"
            >
              Villy / 앤드류
            </Link>{" "}
            - <Trans>translation</Trans> (한국어)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorShade}
              href="https://twitter.com/Shachar700"
            >
              Shahar
            </Link>{" "}
            - <Trans>translation</Trans> (עברית)
          </li>
        </ul>
      </div>
      <Heading size="lg" mb="0.5em" mt="1em">
        <Trans>Feedback</Trans>
      </Heading>
      <Trans>
        Noticed a bug? Something could be done better? Thought of a new cool
        feature you'd like to see on the site? Need help using the site? You can
        either:
      </Trans>
      <List styleType="decimal" m="1em">
        <ListItem>
          <Trans>
            Create an issue on{" "}
            <Link
              href="https://github.com/Sendouc/sendou.ink/issues"
              isExternal
              color={themeColorShade}
            >
              GitHub
            </Link>
          </Trans>
        </ListItem>
        <ListItem>
          <Trans>
            Post on the #helpdesk or #feedback channel of our{" "}
            <Link
              href="https://discord.gg/sendou"
              isExternal
              color={themeColorShade}
            >
              Discord
            </Link>
          </Trans>
        </ListItem>
        <ListItem>
          <Trans>
            DM me on{" "}
            <Link
              href="https://twitter.com/sendouc"
              isExternal
              color={themeColorShade}
            >
              Twitter
            </Link>{" "}
            or Discord (Sendou#0043)
          </Trans>
        </ListItem>
      </List>
    </>
  );
};

export default About;
