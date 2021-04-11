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
    <Flex flexDirection="column" minH="100vh" flexGrow={1} mx={4} mt="23px">
      <MyContainer wide={isWide}>{children}</MyContainer>
    </Flex>
  );
}
