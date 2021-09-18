import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import Layout from "components/layout";
import { Provider as NextAuthProvider } from "next-auth/client";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import { Router } from "next/router";
import NProgress from "nprogress";
import { useEffect } from "react";
import { CSSVariables } from "utils/CSSVariables";
import { activateLocale } from "utils/i18n";
import { locales } from "utils/lists/locales";
import "./styles.css";

NProgress.configure({ showSpinner: false });

let previousUrl: string | undefined = undefined;

Router.events.on("routeChangeStart", (url) => {
  const rootUrl = url.split("?")[0];
  if (rootUrl === previousUrl) return;

  previousUrl = rootUrl;
  NProgress.start();
});
Router.events.on("routeChangeComplete", () => NProgress.done());
Router.events.on("routeChangeError", () => NProgress.done());

const extendedTheme = extendTheme({
  // TODO:
  // 1) round iconButton (closeButton of modal too)
  // 2) table-like lime green input addons
  // 3) input styling
  // 4) focus color
  // 5) form label bolded
  // 6) dropdown border + focus colors // especially in light blends in a lot
  // 7) disable dark mode <-> light mode transformation time
  // 8) divider color (light)
  // 9) link color
  styles: {
    global: {
      body: {
        color: CSSVariables.textColor,
        bg: CSSVariables.bgColor,
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Radio: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Tag: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Badge: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Checkbox: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Switch: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Tabs: {
      defaultProps: {
        colorScheme: "theme",
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          bg: CSSVariables.secondaryBgColor,
        },
      },
    },
    Menu: {
      baseStyle: {
        list: {
          bg: CSSVariables.secondaryBgColor,
        },
      },
    },
    Popover: {
      variants: {
        responsive: {
          content: {
            maxWidth: "unset",
            width: "unset",
          },
        },
      },
    },
  },
  colors: {
    theme: {
      50: CSSVariables.themeColorOpaque,
      100: CSSVariables.themeColor,
      200: CSSVariables.themeColor,
      300: CSSVariables.themeColor,
      400: CSSVariables.themeColor,
      500: CSSVariables.themeColor,
      600: CSSVariables.themeColor,
      700: CSSVariables.themeColor,
      800: CSSVariables.themeColor,
      900: CSSVariables.themeColor,
    },
  },
});

const getUsersLanguage = () => {
  const localeFromLocalStorage = window.localStorage.getItem("locale");
  if (localeFromLocalStorage) {
    return localeFromLocalStorage;
  }

  const browserLanguage = navigator.languages
    ? navigator.languages[0]
    : navigator.language;

  // Could be either "en" or "en-US" for example - that's why the split
  const languageCode = browserLanguage.split("-")[0];
  if (locales.includes(languageCode)) return languageCode;

  return "en";
};

const setDisplayedLanguage = () => {
  activateLocale(getUsersLanguage());
};

const MyApp = ({ Component, pageProps }: AppProps) => {
  useEffect(setDisplayedLanguage, []);

  return (
    <>
      <DefaultSeo
        title="sendou.ink"
        description="Competitive Splatoon hub featuring several tools and resources."
        openGraph={{
          url: "https://sendou.ink/",
          title: "sendou.ink",
          description:
            "Competitive Splatoon hub featuring several tools and resources.",
          images: [
            {
              url: "https://sendou.ink/seo/home.png",
              width: 1200,
              height: 628,
            },
          ],
          site_name: "sendou.ink",
        }}
        twitter={{
          site: "@sendouink",
          cardType: "summary_large_image",
        }}
      />

      <NextAuthProvider session={pageProps.session}>
        <ChakraProvider theme={extendedTheme} cssVarsRoot="body">
          <I18nProvider i18n={i18n}>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </I18nProvider>
        </ChakraProvider>
      </NextAuthProvider>
    </>
  );
};

export default MyApp;
