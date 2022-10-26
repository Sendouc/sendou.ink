import { Theme, useTheme, THEME_LOCAL_STORAGE_KEY } from "~/modules/theme";
import { MoonIcon } from "../icons/Moon";
import { SunIcon } from "../icons/Sun";

export function ColorModeToggle() {
  const [, setTheme] = useTheme();

  /**
   * Toggles the theme & then persists the user's preference to localStorage
   */
  const toggleTheme = () => {
    setTheme((prevTheme) => {
      prevTheme = localStorage.getItem(THEME_LOCAL_STORAGE_KEY) ?? prevTheme;
      const updatedTheme = prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;
      localStorage.setItem(THEME_LOCAL_STORAGE_KEY, updatedTheme);
      return updatedTheme;
    });
  };

  return (
    <button
      className="layout__header__button"
      onClick={toggleTheme}
      data-cy="theme-switch-button"
    >
      <SunIcon className="light-mode-only layout__header__button__icon" />
      <MoonIcon className="dark-mode-only layout__header__button__icon" />
    </button>
  );
}
