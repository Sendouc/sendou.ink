import React from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import {
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  theme,
} from "@chakra-ui/core"
import { ApolloProvider } from "@apollo/react-hooks"
import { QueryParamProvider } from "use-query-params"
import { HelmetProvider } from "react-helmet-async"
import {
  LocationProvider,
  createMemorySource,
  createHistory,
} from "@reach/router"
import ApolloClient from "apollo-boost"
import * as serviceWorker from "./serviceWorker"
import customIcons from "./assets/icons"

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

const customTheme = { ...theme, icons: { ...theme.icons, ...customIcons } }

let history = createHistory(window as any)

ReactDOM.render(
  <LocationProvider history={history}>
    <QueryParamProvider reachHistory={history}>
      <HelmetProvider>
        <ApolloProvider client={client}>
          <ThemeProvider theme={customTheme}>
            <ColorModeProvider>
              <CSSReset />
              <App />
            </ColorModeProvider>
          </ThemeProvider>
        </ApolloProvider>
      </HelmetProvider>
    </QueryParamProvider>
  </LocationProvider>,
  document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
