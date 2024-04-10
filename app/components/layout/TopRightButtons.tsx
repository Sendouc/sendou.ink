import { SUPPORT_PAGE } from "~/utils/urls";
import { LinkButton } from "../Button";
import { HeartIcon } from "../icons/Heart";
import { LanguageChanger } from "./LanguageChanger";
import { ThemeChanger } from "./ThemeChanger";
import { UserItem } from "./UserItem";
import { useTranslation } from "react-i18next";
import * as React from "react";

export function _TopRightButtons({
  showSupport,
  isErrored,
}: {
  showSupport: boolean;
  isErrored: boolean;
}) {
  const { t } = useTranslation(["common"]);

  return (
    <div className="layout__header__right-container">
      {showSupport ? (
        <LinkButton
          to={SUPPORT_PAGE}
          size="tiny"
          icon={<HeartIcon />}
          variant="outlined"
        >
          {t("common:pages.support")}
        </LinkButton>
      ) : null}
      <LanguageChanger />
      <ThemeChanger />
      {!isErrored ? <UserItem /> : null}
    </div>
  );
}

export const TopRightButtons = React.memo(_TopRightButtons);
