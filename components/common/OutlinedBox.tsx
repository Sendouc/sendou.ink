import { BoxProps, Flex } from "@chakra-ui/layout";
import React, { ReactNode } from "react";

export default function OutlinedBox({
  children,
  ...props
}: { children: ReactNode } & BoxProps) {
  return (
    <Flex
      border="1px solid"
      borderColor="whiteAlpha.300"
      rounded="lg"
      px={4}
      py={2}
      alignItems="center"
      {...props}
    >
      {children}
    </Flex>
  );
}
