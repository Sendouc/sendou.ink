import type { MetaFunction } from "@remix-run/node";
import { Trans } from "react-i18next";
import { Main } from "~/components/Main";
import { useSetTitle } from "~/hooks/useSetTitle";
import { languages } from "~/modules/i18n";
import { makeTitle } from "~/utils/strings";
import {
  BORZOIC_TWITTER,
  GITHUB_CONTRIBUTORS_URL,
  LEAN_TWITTER,
  SENDOU_TWITTER_URL,
  TWIG_TWITTER,
  UBERU_TWITTER,
} from "~/utils/urls";
import { type SendouRouteHandle } from "~/utils/remix";
import { useTranslation } from "~/hooks/useTranslation";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Contributions"),
  };
};

export const handle: SendouRouteHandle = {
  i18n: "contributions",
};

const PROGRAMMERS = ["DoubleCookies", "ElementUser", "remmycat"] as const;

const TRANSLATORS: Array<{
  translators: Array<string>;
  language: typeof languages[number]["code"];
}> = [
  {
    translators: ["Frederik"],
    language: "da",
  },
  {
    translators: ["NoAim™bUrn", "Alice"],
    language: "de",
  },
  {
    translators: ["Hachi"],
    language: "es-ES",
  },
  {
    translators: ["Charakiga"],
    language: "fr",
  },
  {
    translators: ["funyaaa", "taqm"],
    language: "ja",
  },
  {
    translators: ["niLPotential"],
    language: "ko",
  },
  {
    translators: ["Ferrari"],
    language: "nl",
  },
  {
    translators: ["DoubleCookies", "Yaga"],
    language: "ru",
  },
  {
    translators: ["たここ", "ShanglinMo", "gellneko"],
    language: "zh",
  },
];

export default function ContributionsPage() {
  const { t } = useTranslation(["common", "contributions"]);
  useSetTitle(t("common:pages.contributors"));

  return (
    <Main>
      <p>
        <Trans i18nKey={"contributions:project"} t={t}>
          Sendou.ink is a project by{" "}
          <a href={SENDOU_TWITTER_URL} target="_blank" rel="noreferrer">
            Sendou
          </a>{" "}
          with help from contributors:
        </Trans>
      </p>
      <ul className="mt-2">
        <li>
          {PROGRAMMERS.join(", ")} -{" "}
          <a href={GITHUB_CONTRIBUTORS_URL} target="_blank" rel="noreferrer">
            {t("contributions:code")}
          </a>
        </li>
        <li>
          <a href={LEAN_TWITTER} target="_blank" rel="noreferrer">
            Lean
          </a>{" "}
          - {t("contributions:lean")}
        </li>
        <li>
          <a href={BORZOIC_TWITTER} target="_blank" rel="noreferrer">
            borzoic
          </a>{" "}
          - {t("contributions:borzoic")}
        </li>
        <li>
          <a href={UBERU_TWITTER} target="_blank" rel="noreferrer">
            uberu
          </a>{" "}
          - {t("contributions:uberu")}
        </li>
        <li>
          <a href={TWIG_TWITTER} target="_blank" rel="noreferrer">
            Twig
          </a>{" "}
          - {t("contributions:twig")}
        </li>
        {TRANSLATORS.map(({ translators, language }) => (
          <li key={language}>
            {translators.join(", ")} - {t("contributions:translation")} (
            {languages.find((lang) => lang.code === language)!.name})
          </li>
        ))}
      </ul>
    </Main>
  );
}
