import type { AppProps } from "next/app";
import { SWRConfig } from "swr";
import "tailwindcss/tailwind.css";
import "./_app.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <SWRConfig
      value={{
        fetcher: (resource, init) =>
          fetch(process.env.NEXT_PUBLIC_BACKEND_URL + resource, init).then(
            (res) => res.json()
          ),
      }}
    >
      <Component {...pageProps} />
    </SWRConfig>
  );
}

export default MyApp;
