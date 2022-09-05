import { Theme, useTheme } from "~/modules/theme";
import { MoonIcon } from "../icons/Moon";
import { SunIcon } from "../icons/Sun";

export function ColorModeToggle() {
  const [, setTheme] = useTheme();

  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT
    );
  };

  return (
    <button
      className="layout__header__color-mode-button"
      onClick={toggleTheme}
      data-cy="theme-switch-button"
    >
      <SunIcon className="light-mode-only layout__header__color-mode-button__icon" />
      <MoonIcon className="dark-mode-only layout__header__color-mode-button__icon" />
    </button>
  );
}
