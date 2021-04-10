import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { mode } from "@chakra-ui/theme-tools";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import Layout from "components/layout";
import "focus-visible/dist/focus-visible";
import { Provider as NextAuthProvider } from "next-auth/client";
import { DefaultSeo } from "next-seo";
import type { AppProps } from "next/app";
import Head from "next/head";
import { Router } from "next/router";
import NProgress from "nprogress";
import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "react-query";
import { Hydrate } from "react-query/hydration";
import { theme } from "theme";
import { activateLocale } from "utils/i18n";
import { locales } from "utils/lists/locales";
import { trpc } from "utils/trpc";
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
  styles: {
    global: (props) => ({
      body: {
        color: mode(theme.light.textColor, theme.dark.textColor)(props),
        bg: mode(theme.light.bgColor, theme.dark.bgColor)(props),
      },
    }),
  },
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
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: mode(
            theme.light.secondaryBgColor,
            theme.dark.secondaryBgColor
          )(props),
        },
      }),
    },
    Menu: {
      baseStyle: (props) => ({
        list: {
          bg: mode(
            theme.light.secondaryBgColor,
            theme.dark.secondaryBgColor
          )(props),
        },
      }),
    },
    Popover: {
      variants: {
        responsive: {
          popper: {
            maxWidth: "unset",
            width: "unset",
          },
        },
      },
    },
  },
  colors: {
    theme: {
      50: "#e4ffdf",
      100: "#bbffb0",
      200: "#92ff7f",
      300: "#68ff4d",
      400: "#3fff1d",
      500: "#27e606",
      600: "#1bb300",
      700: "#108000",
      800: "#054d00",
      900: "#001b00",
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
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // queries never go stale to save some work
            // on our poor database
            staleTime: Infinity,
          },
        },
      })
  );

  return (
    <>
      <Head>
        <link rel="stylesheet" type="text/css" href="/nprogress.css" />
      </Head>
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
        <ChakraProvider theme={extendedTheme}>
          <I18nProvider i18n={i18n}>
            <Layout
              // @ts-expect-error
              header={Component.header}
            >
              <QueryClientProvider client={queryClient}>
                <Hydrate
                  state={trpc.useDehydratedState(pageProps.dehydratedState)}
                >
                  <Component {...pageProps} />
                </Hydrate>
              </QueryClientProvider>
            </Layout>
          </I18nProvider>
        </ChakraProvider>
      </NextAuthProvider>
    </>
  );
};

export default MyApp;
