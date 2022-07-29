import MyHeading from "components/elements/Heading";
import { t, Trans } from "@lingui/macro";
import MyHead from "components/common/MyHead";
import MyLink from "components/common/MyLink";

const About = () => {
  return (
    <>
      <MyHead title={t`About`} />
      This site was made by Sendou with help from the people below.
      <section className="mt-4">
        <MyHeading className="mb-2" size="3xl">
          <Trans>Thanks to</Trans>
        </MyHeading>
        <ul className="ml-6">
          <li>
            <MyLink isExternal href="https://twitter.com/LeanYoshi">
              Lean
            </MyLink>{" "}
            - <Trans>provided the data for Top 500 X Rank and League</Trans>
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/zorg_z0rg_z0r8">
              zorg
            </MyLink>{" "}
            -{" "}
            <Trans>
              provided background pictures of 4v4 maps for the map planner
            </Trans>
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/ganbawoomy">
              ganbawoomy
            </MyLink>{" "}
            - <Trans>provided the data for tournament browser</Trans>
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/noaim_brn">
              NoAim™bUrn
            </MyLink>{" "}
            - <Trans>gave plenty of useful feedback</Trans>
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/borzoic_">
              borzoic
            </MyLink>{" "}
            - art for the site - front page inkling, icons, footer drawing and
            badges
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/DblCookies">
              DblCookies
            </MyLink>{" "}
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
            <MyLink isExternal href="https://twitter.com/rofreg">
              Ryan Laughlin
            </MyLink>{" "}
            -{" "}
            <Trans>
              <MyLink
                isExternal
                isColored={false}
                href="https://github.com/Sendouc/sendou.ink/pulls?q=is%3Apr+is%3Aclosed+author%3Arofreg+"
              >
                <Trans>Contributions to the codebase</Trans>
              </MyLink>
            </Trans>
          </li>
          <li>
            <MyLink
              isExternal
              isColored={false}
              href="https://twitter.com/Yuza_i"
            >
              yuza
            </MyLink>{" "}
            - <Trans>translation</Trans> (Deutsch)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/spookyporo">
              naga
            </MyLink>{" "}
            - <Trans>translation</Trans> (Español (España))
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/Grey_spl">
              Grey
            </MyLink>{" "}
            - <Trans>translation</Trans> (Français)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/DatPretto">
              Pretto
            </MyLink>{" "}
            - <Trans>translation</Trans> (Italiano)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/VoltoMatte">
              Volto
            </MyLink>{" "}
            - <Trans>translation</Trans> (Italiano)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/Guigas_Jr">
              Guigas
            </MyLink>{" "}
            - <Trans>translation</Trans> (Português)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/Walavouchey">
              Walavouchey
            </MyLink>{" "}
            - <Trans>translation</Trans> (Svenska)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/sp9rK_spl">
              sp9rK
            </MyLink>{" "}
            - <Trans>translation</Trans> (Ελληνικά)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/TehVilly">
              Villy / 앤드류
            </MyLink>{" "}
            - <Trans>translation</Trans> (한국어)
          </li>
          <li>
            <MyLink isExternal href="https://twitter.com/Shachar700">
              Shahar
            </MyLink>{" "}
            - <Trans>translation</Trans> (עברית)
          </li>
        </ul>
      </section>
      <section className="mt-4">
        <MyHeading className="mb-2" size="3xl">
          <Trans>Feedback</Trans>
        </MyHeading>
        <Trans>
          Noticed a bug? Something could be done better? Thought of a new cool
          feature you&apos;d like to see on the site? Need help using the site?
          You can either:
        </Trans>
        <ol className="mt-4 ml-6">
          <li>
            <Trans>
              Create an issue on{" "}
              <MyLink
                href="https://github.com/Sendouc/sendou.ink/issues"
                isExternal
              >
                GitHub
              </MyLink>
            </Trans>
          </li>
          <li>
            <Trans>
              Post on the #helpdesk or #feedback channel of our{" "}
              <MyLink href="https://discord.gg/sendou" isExternal>
                Discord
              </MyLink>
            </Trans>
          </li>
          <li>
            <Trans>
              DM me on{" "}
              <MyLink href="https://twitter.com/sendouc" isExternal>
                Twitter
              </MyLink>{" "}
              or Discord (Sendou#0043)
            </Trans>
          </li>
        </ol>
      </section>
    </>
  );
};

export default About;
