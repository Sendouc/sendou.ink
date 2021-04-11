import { Flex } from "@chakra-ui/layout";
import React from "react";
import MyContainer from "./MyContainer";
import RightSidebar from "./RightSidebar";

export default function Page({
  children,
  isWide = false,
  sidebar,
}: {
  children: React.ReactNode;
  isWide?: boolean;
  sidebar?: React.ReactNode;
}) {
  return (
    <Flex flexGrow={1} flexDir={["column-reverse", null, "row"]}>
      <Flex flexDirection="column" minH="100vh" mt="23px" width="100%">
        <MyContainer wide={isWide}>{children}</MyContainer>
      </Flex>

      {sidebar && <RightSidebar>{sidebar}</RightSidebar>}
    </Flex>
  );
}
