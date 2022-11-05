import { useTranslation } from "~/hooks/useTranslation";
import { languages } from "~/modules/i18n";
import { LinkButton } from "../Button";
import { GlobeIcon } from "../icons/Globe";
import { Popover } from "../Popover";

export function LanguageChanger() {
  const { t, i18n } = useTranslation();

  return (
    <Popover
      buttonChildren={
        <GlobeIcon
          alt={t("header.language")}
          className="layout__header__button__icon"
        />
      }
      triggerClassName="layout__header__button"
    >
      <div className="layout__user-popover">
        {languages.map((lang) => (
          <LinkButton
            key={lang.code}
            tiny
            variant="minimal"
            className={
              i18n.language !== lang.code ? "text-main-forced" : undefined
            }
            to={`?lng=${lang.code}`}
          >
            {lang.name}
          </LinkButton>
        ))}
      </div>
    </Popover>
  );
}
