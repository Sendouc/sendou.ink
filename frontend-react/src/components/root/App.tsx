import { ChakraProvider, extendTheme } from "@chakra-ui/core";
import React from "react";
import { useTheme } from "../../hooks/useTheme";
import "./App.css";
import Layout from "./Layout";
import Routes from "./Routes";

const App: React.FC = () => {
  const theme = useTheme();

  return (
    <ChakraProvider theme={extendTheme(theme)}>
      <Layout>
        <Routes />
      </Layout>
    </ChakraProvider>
  );
};

export default App;
