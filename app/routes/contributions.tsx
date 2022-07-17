import type { MetaFunction } from "@remix-run/node";
import { Trans, useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { useSetTitle } from "~/hooks/useSetTitle";
import { makeTitle } from "~/utils/strings";
import {
  BORZOIC_TWITTER,
  GITHUB_CONTRIBUTORS_URL,
  LEAN_TWITTER,
  SENDOU_TWITTER_URL,
  UBERU_TWITTER,
} from "~/utils/urls";

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("Contributions"),
  };
};

export const handle = {
  i18n: "contributions",
};

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
      </ul>
    </Main>
  );
}
