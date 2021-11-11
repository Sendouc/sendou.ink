import "normalize.css";
import "./_app.css";

import { AppProps } from "next/app";
import Head from "next/head";
import { Layout } from "components/layout/Layout";
import { globalCss } from "stitches.config";
import { Provider, createClient, fetchExchange } from "urql";
import customScalarsExchange from "urql-custom-scalars-exchange";
import schema from "generated/introspection.json";

const globalStyles = globalCss({
  "*": { boxSizing: "border-box" },
  "*::before": { boxSizing: "border-box" },
  "*::after": { boxSizing: "border-box" },
  body: {
    backgroundColor: "$bg",
    color: "$text",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji"',
    lineHeight: 1.55,
    "-webkit-font-smoothing": "antialiased",
    "-moz-osx-font-smoothing": "antialiased",
  },
});

const client = createClient({
  url: "http://localhost:4000/graphql",
  exchanges: [
    customScalarsExchange({
      schema: schema as any,
      scalars: {
        Datetime(value) {
          return new Date(value);
        },
      },
    }),
    fetchExchange,
  ],
});

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  globalStyles();

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Provider value={client}>
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </Provider>
    </>
  );
}
