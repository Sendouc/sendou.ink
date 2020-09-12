import React from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import { ChakraProvider } from "@chakra-ui/core"
import theme from "@chakra-ui/theme"
import { ApolloProvider } from "@apollo/react-hooks"
import { QueryParamProvider } from "use-query-params"
import { HelmetProvider } from "react-helmet-async"
import { LocationProvider, createHistory } from "@reach/router"
import * as Sentry from "@sentry/react"
import ApolloClient from "apollo-boost"
import * as serviceWorker from "./serviceWorker"
import "./i18n"

if (process.env.NODE_ENV === "production") {
  Sentry.init({
    dsn:
      "https://fbdedefb54744b33aa0450f1f9f52ee9@o443322.ingest.sentry.io/5416867",
  })
}

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

let history = createHistory(window as any)

ReactDOM.render(
  <LocationProvider history={history}>
    <QueryParamProvider reachHistory={history}>
      <HelmetProvider>
        <ApolloProvider client={client}>
          <ChakraProvider theme={theme} resetCSS>
            <App />
          </ChakraProvider>
        </ApolloProvider>
      </HelmetProvider>
    </QueryParamProvider>
  </LocationProvider>,
  document.getElementById("root")
)

serviceWorker.unregister()
