import { Box } from "@chakra-ui/layout";
import React from "react";

export default function RightSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box
      display={["none", null, null, "block"]}
      width="12rem"
      mx={4}
      mt="23px"
      top={4}
      position={["inherit", null, "sticky"]}
      alignSelf="flex-start"
    >
      {children}
    </Box>
  );
}
