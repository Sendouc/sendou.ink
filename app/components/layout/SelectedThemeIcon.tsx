import { useTranslation } from "~/hooks/useTranslation";
import { MoonIcon } from "../icons/Moon";
import { SunIcon } from "../icons/Sun";
import { SunAndMoonIcon } from "../icons/SunAndMoon";
import { Theme, useTheme } from "~/features/theme/core/provider";

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
