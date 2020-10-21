import { ApolloProvider } from "@apollo/client";
import { ChakraProvider, extendTheme } from "@chakra-ui/core";
import { mode } from "@chakra-ui/theme-tools";
import { useApollo } from "lib/apollo";
import { Provider as NextAuthProvider } from "next-auth/client";
import GoogleFonts from "next-google-fonts";
import type { AppProps } from "next/app";
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
  components: {
    Button: {
      defaultProps: {
        colorScheme: "lime",
        color: "black",
      },
    },
    // IconButton: {
    //   defaultProps: {
    //     isRound: true,
    //   },
    // },
    Modal: {
      baseStyle: (props) => ({
        content: {
          bg: mode(
            theme.light.secondaryBgColor,
            theme.dark.secondaryBgColor
          )(props),
        },
      }),
    },
  },
  colors: {
    lime: {
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

  return (
    <>
      <GoogleFonts
        href={`https://fonts.googleapis.com/css2?family=Rubik&display=swap`}
      />
      <NextAuthProvider session={props.pageProps.session}>
        <ApolloProvider client={apolloClient}>
          <ChakraProvider theme={extendedTheme}>
            <Layout {...props} />
          </ChakraProvider>
        </ApolloProvider>
      </NextAuthProvider>
    </>
  );
};

export default MyApp;
