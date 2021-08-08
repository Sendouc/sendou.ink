import { UseToastOptions } from "@chakra-ui/react";
import { Serialized } from "./types";

export const getToastOptions = (
  description: NonNullable<UseToastOptions["description"]>,
  status: NonNullable<UseToastOptions["status"]>
): UseToastOptions => ({
  description,
  status,
  duration: 7000,
  isClosable: true,
  position: "top-right",
});

export const serializeDataForGetStaticProps = <T>(data: T): Serialized<T> =>
  JSON.parse(JSON.stringify(data));
