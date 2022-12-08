import { useTranslation } from "~/hooks/useTranslation";
import { Theme, useTheme } from "~/modules/theme";
import { MoonIcon } from "../icons/Moon";
import { SunIcon } from "../icons/Sun";
import { SunAndMoonIcon } from "../icons/SunAndMoon";

const ThemeIcons = {
  [Theme.LIGHT]: SunIcon,
  [Theme.DARK]: MoonIcon,
  auto: SunAndMoonIcon,
};

export function SelectedThemeIcon({ size }: { size?: number }) {
  const { t } = useTranslation();
  const { userTheme } = useTheme();

  if (!userTheme) return null;

  const SelectedIcon = ThemeIcons[userTheme];

  return (
    <SelectedIcon
      alt={t("header.theme")}
      className="layout__header__button__icon"
      size={size}
    />
  );
}
