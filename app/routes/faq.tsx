import type { LinksFunction, MetaFunction } from "@remix-run/node";
import { useTranslation } from "react-i18next";
import { Main } from "~/components/Main";
import styles from "~/styles/faq.css";
import { makeTitle } from "~/utils/remix";

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
  const { t } = useTranslation("faq");
  return (
    <Main className="stack md">
      {new Array(AMOUNT_OF_QUESTIONS).fill(null).map((_, i) => {
        const questionNumber = i + 1;
        return (
          <details key={i} className="faq__details">
            <summary className="faq__summary">
              {t(`faq.q${questionNumber}`)}
            </summary>
            <p>{t(`faq.a${questionNumber}`)}</p>
          </details>
        );
      })}
    </Main>
  );
}
