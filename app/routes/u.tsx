import { Main } from "~/components/Main";
import type { LinksFunction } from "@remix-run/node";
import styles from "~/styles/front.css";
import { useTranslation } from "react-i18next";

export const links: LinksFunction = () => {
  return [{ rel: "stylesheet", href: styles }];
};

export default function ArticlesMainPage() {
  const { t } = useTranslation("common");

  return (
    <Main className="stack lg">
      <h1>{t("actions.search")}</h1>
      <p>Insert search stuff here</p>
    </Main>
  );
}
