import { ChakraProvider } from "@chakra-ui/core";
import type { AppProps } from "next/app";
import Layout from "scenes/Layout";

const MyApp = (props: AppProps) => {
  return (
    <ChakraProvider>
      <Layout {...props} />
    </ChakraProvider>
  );
};

export default MyApp;
