import React, { StrictMode } from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import {
  ThemeProvider,
  ColorModeProvider,
  CSSReset,
  theme,
} from "@chakra-ui/core"
import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import "./index.css"
import * as serviceWorker from "./serviceWorker"

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
})

const customTheme = {
  ...theme,
  colors: { ...theme.colors, textColor: { light: "#0d0d0d", dark: "#fffffe" } },
}

ReactDOM.render(
  <StrictMode>
    <ApolloProvider client={client}>
      <ThemeProvider theme={customTheme}>
        <ColorModeProvider>
          <CSSReset />
          <App />
        </ColorModeProvider>
      </ThemeProvider>
    </ApolloProvider>
  </StrictMode>,
  document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
