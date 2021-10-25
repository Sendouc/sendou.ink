import "./_app.css";

import { AppProps } from "next/app";
import Head from "next/head";
import { MantineProvider, NormalizeCSS } from "@mantine/core";
import { SWRConfig } from "swr";
import { Layout } from "../components/layout";

export default function App(props: AppProps) {
  const { Component, pageProps } = props;

  return (
    <>
      <Head>
        <title>Page title</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>

      <MantineProvider
        theme={{
          colorScheme: "dark",
          primaryColor: "violet",
        }}
      >
        <NormalizeCSS />
        <SWRConfig
          value={{
            fetcher: (resource, init) =>
              fetch(process.env.NEXT_PUBLIC_BACKEND_URL + resource, init).then(
                (res) => res.json()
              ),
          }}
        >
          <Layout>
            <Component {...pageProps} />
          </Layout>
        </SWRConfig>
      </MantineProvider>
    </>
  );
}
