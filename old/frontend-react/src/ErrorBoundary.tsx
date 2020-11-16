// @ts-nocheck
import { Box, Flex, Heading, Image } from "@chakra-ui/react";
import React from "react";
import { AiOutlineReload } from "react-icons/ai";
import errorGirl from "./assets/error_girl.png";

type HocProps = {
  // here you can extend hoc with new props
};
type HocState = {
  readonly error: Error | null | undefined;
};

class ErrorBoundary extends React.Component<HocProps, HocState> {
  readonly state: HocState = {
    error: null,
  };

  componentDidCatch(error: Error | null, errorInfo: object) {
    this.setState({ error: error });
  }

  render() {
    if (this.state.error) {
      if (this.state.error.message.includes("Loading chunk")) {
        return (
          <Flex
            flexDir="column"
            justifyContent="center"
            alignItems="center"
            bg="white"
            padding="6rem"
            borderRadius="5px"
          >
            <Heading as="h3" mx="auto">
              New version of sendou.ink has been released! Click the icon below
              to reload the page and start using the newest version.
            </Heading>
            <AiOutlineReload
              style={{
                width: "48px",
                height: "48px",
                cursor: "pointer",
                color: "blue",
              }}
              onClick={() => window.location.reload(false)}
            />
          </Flex>
        );
      }
      return (
        <Flex
          flexDir="column"
          justifyContent="center"
          alignItems="center"
          bg="white"
          padding="6rem"
          borderRadius="5px"
        >
          <Image w="24rem" mx="auto" src={errorGirl} />
          <Heading as="h3" mx="auto">
            An <span style={{ color: "red" }}>error</span> occurred:{" "}
            {this.state.error.message}
          </Heading>
          <Box my={24} textAlign="center">
            If you let me know on{" "}
            <a
              style={{ color: "green" }}
              href="https://github.com/Sendouc/sendou.ink/issues/new"
              rel="noreferrer"
              target="_blank"
            >
              GitHub
            </a>
            ,{" "}
            <a
              style={{ color: "green" }}
              href="https://discord.gg/sendou"
              rel="noreferrer"
              target="_blank"
            >
              Discord
            </a>{" "}
            or{" "}
            <a
              style={{ color: "green" }}
              href="https://www.twitter.com/sendouc"
              rel="noreferrer"
              target="_blank"
            >
              Twitter
            </a>{" "}
            I can do my best to get the problem fixed!
          </Box>
          <pre style={{ width: "80vw", margin: "auto 0", overflow: "scroll" }}>
            <code>{this.state.error.stack}</code>
          </pre>
        </Flex>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
