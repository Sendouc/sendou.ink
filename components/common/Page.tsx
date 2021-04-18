import { Flex } from "@chakra-ui/layout";
import React from "react";
import MyContainer from "./MyContainer";

export default function Page({
  children,
  isWide = false,
}: {
  children: React.ReactNode;
  isWide?: boolean;
}) {
  return (
    <Flex flexGrow={1} flexDir={["column-reverse", null, "row"]}>
      <Flex
        flexGrow={1}
        flexDirection="column"
        minH="100vh"
        mt={5}
        width="100%"
      >
        <MyContainer wide={isWide}>{children}</MyContainer>
      </Flex>
    </Flex>
  );
}
