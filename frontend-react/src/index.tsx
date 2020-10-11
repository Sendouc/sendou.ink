import { ApolloClient, ApolloProvider, InMemoryCache } from "@apollo/client";
import { ChakraProvider } from "@chakra-ui/core";
import { createHistory, LocationProvider } from "@reach/router";
import React from "react";
import ReactDOM from "react-dom";
import { HelmetProvider } from "react-helmet-async";
import { QueryParamProvider } from "use-query-params";
import App from "./components/root/App";
import ErrorBoundary from "./ErrorBoundary";
import "./i18n";
import * as serviceWorker from "./serviceWorker";

const client = new ApolloClient({
  uri:
    process.env.NODE_ENV === "production"
      ? "/graphql"
      : "http://localhost:3001/graphql",
  cache: new InMemoryCache(),
});

let history = createHistory(window as any);

ReactDOM.render(
  <ErrorBoundary>
    <LocationProvider history={history}>
      <QueryParamProvider reachHistory={history}>
        <HelmetProvider>
          <ApolloProvider client={client}>
            <ChakraProvider>
              <App />
            </ChakraProvider>
          </ApolloProvider>
        </HelmetProvider>
      </QueryParamProvider>
    </LocationProvider>
  </ErrorBoundary>,
  document.getElementById("root")
);

serviceWorker.unregister();
