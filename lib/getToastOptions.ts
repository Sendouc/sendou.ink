import { UseToastOptions } from "@chakra-ui/react";

export const getToastOptions = (
  description: NonNullable<UseToastOptions["description"]>,
  status: NonNullable<UseToastOptions["status"]>
): UseToastOptions => ({
  description,
  status,
  duration: 9000,
  isClosable: true,
  position: "top-right",
});
