import { useTranslation } from "~/hooks/useTranslation";
import { Theme, useTheme } from "~/modules/theme";
import { Button } from "../Button";
import { MoonIcon } from "../icons/Moon";
import { SunIcon } from "../icons/Sun";
import { SunAndMoonIcon } from "../icons/SunAndMoon";
import { Popover } from "../Popover";
import { SelectedThemeIcon } from "./SelectedThemeIcon";

const ThemeIcons = {
  [Theme.LIGHT]: SunIcon,
  [Theme.DARK]: MoonIcon,
  auto: SunAndMoonIcon,
};

export function ThemeChanger({
  children,
  plain,
}: {
  children?: React.ReactNode;
  plain?: boolean;
}) {
  const { userTheme, setUserTheme } = useTheme();
  const { t } = useTranslation();

  if (!userTheme) {
    return null;
  }

  return (
    <Popover
      buttonChildren={children ?? <SelectedThemeIcon />}
      triggerClassName={plain ? undefined : "layout__header__button"}
    >
      <div className="layout__user-popover">
        {(["auto", Theme.DARK, Theme.LIGHT] as const).map((theme) => {
          const Icon = ThemeIcons[theme];
          const selected = userTheme === theme;
          return (
            <Button
              variant="minimal"
              key={theme}
              size="tiny"
              icon={<Icon alt="" />}
              // TODO: Remove this and find better semantic representation than
              // just multiple buttons. Maybe radio group?
              aria-current={selected}
              className={selected ? undefined : "text-main-forced"}
              onClick={() => setUserTheme(theme)}
            >
              {t(`theme.${theme}`)}
            </Button>
          );
        })}
      </div>
    </Popover>
  );
}
