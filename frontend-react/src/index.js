import React from "react"
import ReactDOM from "react-dom"
import App from "./components/root/App"
import * as serviceWorker from "./serviceWorker"
import { ApolloProvider } from "@apollo/react-hooks"
import { QueryParamProvider } from "use-query-params"
import ApolloClient from "apollo-boost"
import { BrowserRouter as Router, Route } from "react-router-dom"
import "semantic-ui-css/semantic.min.css"
import "./index.css"

//TODO: figure out how to do this well
const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql"
})

ReactDOM.render(
  <Router>
    <QueryParamProvider ReactRouterRoute={Route}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </QueryParamProvider>
  </Router>,
  document.getElementById("root")
)

serviceWorker.unregister()
