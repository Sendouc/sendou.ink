import React from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import * as serviceWorker from "./serviceWorker"
import { ApolloProvider } from "@apollo/react-hooks"
import ApolloClient from "apollo-boost"
import { BrowserRouter as Router } from "react-router-dom"
import "semantic-ui-css/semantic.min.css"
import "./index.css"

const client = new ApolloClient({
  uri:
    process.env.REACT_APP_APOLLO_URI === "local"
      ? "http://localhost:3001/graphql"
      : "https://www.sendou.ink/graphql"
})

ReactDOM.render(
  <Router>
    <ApolloProvider client={client}>
      <App />
    </ApolloProvider>
  </Router>,
  document.getElementById("root")
)

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister()
