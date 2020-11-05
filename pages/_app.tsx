import { ApolloProvider } from "@apollo/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/core";
import { mode } from "@chakra-ui/theme-tools";
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import { useApollo } from "lib/apollo";
import { activate } from "lib/i18n";
import { Provider as NextAuthProvider } from "next-auth/client";
import GoogleFonts from "next-google-fonts";
import type { AppProps } from "next/app";
import { useEffect } from "react";
import Layout from "scenes/Layout";
import { theme } from "theme";

const extendedTheme = extendTheme({
  styles: {
    global: (props) => ({
      body: {
        fontFamily: "'Rubik', sans-serif",
        color: mode(theme.light.textColor, theme.dark.textColor)(props),
        bg: mode(theme.light.bgColor, theme.dark.bgColor)(props),
      },
    }),
  },
  // FIXME:
  // 1) round iconButton (closeButton of modal too)
  // 2) table-like lime green input addons
  // 3) input styling
  // 4) focus color
  // 5) form label bolded
  // 6) dropdown border + focus colors // especially in light blends in a lot
  // 7) disable dark mode <-> light mode transformation time
  // 8) divider color (light)
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

const MyApp = (props: AppProps) => {
  const apolloClient = useApollo(props.pageProps.initialApolloState);

  useEffect(() => {
    activate("en");
  }, []);

  return (
    <>
      <GoogleFonts
        href={`https://fonts.googleapis.com/css2?family=Rubik&display=swap`}
      />
      <NextAuthProvider session={props.pageProps.session}>
        <ApolloProvider client={apolloClient}>
          <ChakraProvider theme={extendedTheme}>
            <I18nProvider i18n={i18n}>
              <Layout {...props} />
            </I18nProvider>
          </ChakraProvider>
        </ApolloProvider>
      </NextAuthProvider>
    </>
  );
};

export default MyApp;
