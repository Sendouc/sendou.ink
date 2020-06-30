import React, { useContext } from "react"
import { RouteComponentProps } from "@reach/router"
import { Heading, Link, List, ListItem } from "@chakra-ui/core"
import MyThemeContext from "../../themeContext"
import { Helmet } from "react-helmet-async"
import { useTranslation, Trans } from "react-i18next"

const About: React.FC<RouteComponentProps> = () => {
  const { t } = useTranslation()
  const { themeColorWithShade } = useContext(MyThemeContext)
  return (
    <>
      <Helmet>
        <title>{t("footer;About")} | sendou.ink</title>
      </Helmet>
      <div style={{ marginTop: "1em" }}>
        <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
          {t("footer;Feedback")}
        </Heading>
        {t("footer;feedbackText")}
        <List styleType="decimal" mt="1em">
          <ListItem>
            <Trans i18nKey="footer;createIssue">
              Create an issue on{" "}
              <Link
                href="https://github.com/Sendouc/sendou-ink/issues"
                isExternal
                color={themeColorWithShade}
              >
                GitHub
              </Link>
            </Trans>
          </ListItem>
          <ListItem>
            <Trans i18nKey="footer;postOnDiscord">
              Post on the #helpdesk or #feedback channel of our{" "}
              <Link
                href="https://discord.gg/J6NqUvt"
                isExternal
                color={themeColorWithShade}
              >
                Discord
              </Link>
            </Trans>
          </ListItem>
          <ListItem>
            <Trans i18nKey="footer;dmMe">
              DM me on{" "}
              <Link
                href="https://twitter.com/sendouc"
                isExternal
                color={themeColorWithShade}
              >
                Twitter
              </Link>{" "}
              or Discord (Sendou#0043)
            </Trans>
          </ListItem>
        </List>
      </div>
      <div style={{ marginTop: "1em" }}>
        <Heading size="lg" mb="0.5em" fontFamily="'Rubik', sans-serif">
          {t("footer;Thanks to")}
        </Heading>
        <ul style={{ marginLeft: "1.2em", marginTop: "0.5em" }}>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/LeanYoshi"
            >
              Lean
            </Link>{" "}
            - {t("footer;provided the Top 500 X Rank data")}
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/zorg_z0rg_z0r8"
            >
              zorg
            </Link>{" "}
            - {t("footer;provided background pictures for the map planner")}
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/ganbawoomy"
            >
              ganbawoomy
            </Link>{" "}
            - {t("footer;provided the data for tournament browser")}
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/noaim_brn"
            >
              NoAim™bUrn
            </Link>{" "}
            - {t("footer;gave plenty of useful feedback")}
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/borzoic_"
            >
              borzoic
            </Link>{" "}
            -{" "}
            {t(
              "footer;art for the site like the inkling on the front page as well as footer pictures"
            )}
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/DatPretto"
            >
              Pretto
            </Link>{" "}
            - {t("footer;translation")} (Italiano)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/VoltoMatte"
            >
              Volto
            </Link>{" "}
            - {t("footer;translation")} (Italiano)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/sp9rK_spl"
            >
              sp9rK
            </Link>{" "}
            - {t("footer;translation")} (Ελληνικά)
          </li>
          <li>
            <Link
              isExternal
              color={themeColorWithShade}
              href="https://twitter.com/V_CH3RRY"
            >
              Villy / 앤드류
            </Link>{" "}
            - {t("footer;translation")} (한국어)
          </li>
        </ul>
      </div>
    </>
  )
}

export default About
