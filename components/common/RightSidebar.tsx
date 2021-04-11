import { Box } from "@chakra-ui/layout";
import React from "react";

export default function RightSidebar({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Box width="12rem" mx={4} mt="23px">
      {children}
    </Box>
  );
}
