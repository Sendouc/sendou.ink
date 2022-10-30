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
    <button className="layout__header__button" onClick={toggleTheme}>
      <SunIcon className="light-mode-only layout__header__button__icon" />
      <MoonIcon className="dark-mode-only layout__header__button__icon" />
    </button>
  );
}
