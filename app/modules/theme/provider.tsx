import { useFetcher } from "@remix-run/react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import { createContext, useContext, useEffect, useRef, useState } from "react";

const THEME_LOCAL_STORAGE_KEY = "theme-preference";

enum Theme {
  DARK = "dark",
  LIGHT = "light",
}
const themes: Array<Theme> = Object.values(Theme);

type ThemeContextType = [Theme | null, Dispatch<SetStateAction<Theme | null>>];

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const prefersLightMQ = "(prefers-color-scheme: light)";

/**
 * Retrieves the preferred Theme by the user based on what is stored in the web browser's LocalStorage.
 *  - If none is found, then we use the theme based on the predefined preferred color scheme instead.
 * 
 * @returns the preferred Theme of the user
 */
const getPreferredTheme = () => {
  let preferredTheme = window.matchMedia(prefersLightMQ).matches ? Theme.LIGHT : Theme.DARK;
  const localStorageTheme = localStorage.getItem(THEME_LOCAL_STORAGE_KEY) as Theme;
  if (typeof localStorageTheme !== "undefined" && localStorageTheme !== null) {
    preferredTheme = localStorageTheme;
  }

  return preferredTheme;
}

function ThemeProvider({
  children,
  specifiedTheme,
}: {
  children: ReactNode;
  specifiedTheme: Theme | null;
}) {
  const [theme, setTheme] = useState<Theme | null>(() => {
    // On the server, if we don't have a specified theme then we should
    // return null and the clientThemeCode will set the theme for us
    // before hydration. Then (during hydration), this code will get the same
    // value that clientThemeCode got so hydration is happy.
    if (specifiedTheme) {
      if (themes.includes(specifiedTheme)) {
        return specifiedTheme;
      } else {
        return null;
      }
    }

    // there's no way for us to know what the theme should be in this context
    // the client will have to figure it out before hydration.
    if (typeof document === "undefined") {
      return null;
    }

    return getPreferredTheme();
  });

  const persistTheme = useFetcher();
  // TODO: remove this when persistTheme is memoized properly
  const persistThemeRef = useRef(persistTheme);
  useEffect(() => {
    persistThemeRef.current = persistTheme;
  }, [persistTheme]);

  const mountRun = useRef(false);

  useEffect(() => {
    if (!mountRun.current) {
      mountRun.current = true;
      return;
    }
    if (!theme) {
      return;
    }

    persistThemeRef.current.submit(
      { theme },
      { action: "theme", method: "post" }
    );
  }, [theme]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(prefersLightMQ);
    const handleChange = () => {
      setTheme(mediaQuery.matches ? Theme.DARK : Theme.LIGHT);
    };
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      {children}
    </ThemeContext.Provider>
  );
}

/** 
 * This is how I make certain we avoid a flash of the wrong theme. 
 * If you select a theme, then I'll know what you want in the future and you'll not see this script anymore.
 * 
 * TODO: if additional themes are planned to be supported in the future, the number of theme combination strings must be updated/refactored!
 */
const clientThemeCode = `
;(() => {
  let theme = 'light';
  const localStorageTheme = localStorage.getItem('theme-preference');
  if (typeof localStorageTheme !== "undefined" && localStorageTheme !== null) {
    theme = localStorageTheme;
  }
  
  const cl = document.documentElement.classList;
  const themeAlreadyApplied = cl.contains('light') || cl.contains('dark');
  if (themeAlreadyApplied) {
    console.warn(
      "Script is running but theme is already applied",
    );
  } else {
    cl.add(theme);
  }
  const meta = document.querySelector('meta[name=color-scheme]');
  if (meta) {
    if (theme === 'dark') {
      meta.content = 'dark light';
    } else if (theme === 'light') {
      meta.content = 'light dark';
    }
  } else {
    console.warn(
      "No meta tag",
    );
  }
})();
`;

function ThemeHead({ ssrTheme }: { ssrTheme: boolean }) {
  const [theme] = useTheme();

  return (
    <>
      {/*
        On the server, "theme" might be `null`, so clientThemeCode ensures that
        this is correct before hydration.
      */}
      <meta
        name="color-scheme"
        content={theme === "light" ? "light dark" : "dark light"}
      />
      {/*
        If we know what the theme is from the server then we don't need
        to do fancy tricks prior to hydration to make things match.
      */}
      {ssrTheme ? null : (
        <>
          <script
            // NOTE: we cannot use type="module" because that automatically makes
            // the script "defer". That doesn't work for us because we need
            // this script to run synchronously before the rest of the document
            // is finished loading.
            dangerouslySetInnerHTML={{ __html: clientThemeCode }}
          />
        </>
      )}
    </>
  );
}

function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

function isTheme(value: unknown): value is Theme {
  return typeof value === "string" && themes.includes(value as Theme);
}

export { isTheme, Theme, ThemeHead, ThemeProvider, useTheme, THEME_LOCAL_STORAGE_KEY };
