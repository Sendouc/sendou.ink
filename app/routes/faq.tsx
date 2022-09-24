import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import { useSetTitle } from "~/hooks/useSetTitle";
import styles from "~/styles/faq.css";
import { makeTitle } from "~/utils/strings";

const AMOUNT_OF_QUESTIONS = 3;

export const meta: MetaFunction = () => {
  return {
    title: makeTitle("FAQ"),
    description: "Frequently asked questions",
  };
};

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export const handle = {
  i18n: "faq",
};

export default function FAQPage() {
  const { t } = useTranslation(["faq", "common"]);
  useSetTitle(t("common:pages.faq"));

  return (
    <Main className="stack md">
      {new Array(AMOUNT_OF_QUESTIONS).fill(null).map((_, i) => {
        const questionNumber = i + 1;
        return (
          <details key={i} className="faq__details">
            <summary className="faq__summary">
              {t(`faq:q${questionNumber}` as any)}
            </summary>
            <p
              dangerouslySetInnerHTML={{
                __html: t(`faq:a${questionNumber}` as any),
              }}
            />
          </details>
        );
      })}
    </Main>
  );
}
