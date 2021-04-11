import { Box, Grid } from "@chakra-ui/layout";
import { useMediaQuery } from "@chakra-ui/media-query";
import {
  Table,
  TableCaption,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/table";
import React, { Fragment } from "react";

export default function NewTable({
  caption,
  headers,
  data,
}: {
  caption?: string;
  headers: {
    name: string;
    dataKey: string;
  }[];
  data: (Record<string, React.ReactNode> & { id: number })[];
}) {
  const [isSmall] = useMediaQuery("(max-width: 600px)");

  if (isSmall) {
    return (
      <>
        {data.map((row) => {
          return (
            <Grid
              key={row.id}
              as="section"
              border="1px solid"
              borderColor="whiteAlpha.300"
              rounded="lg"
              px={4}
              py={2}
              mb={4}
              templateColumns="1fr 2fr"
              gridRowGap={1}
              alignItems="center"
            >
              {headers.map(({ name, dataKey }) => {
                return (
                  <Fragment key={dataKey}>
                    <Box
                      textTransform="uppercase"
                      fontWeight="bold"
                      fontSize="sm"
                      fontFamily="heading"
                      letterSpacing="wider"
                      color="gray.400"
                      mr={2}
                    >
                      {name}
                    </Box>
                    <Box>{row[dataKey]}</Box>
                  </Fragment>
                );
              })}
            </Grid>
          );
        })}
      </>
    );
  }

  return (
    <Box
      border="1px solid"
      borderColor="whiteAlpha.300"
      rounded="lg"
      px={4}
      py={2}
    >
      <Table variant="simple">
        {caption && <TableCaption placement="top">{caption}</TableCaption>}
        <Thead>
          <Tr>
            {headers.map(({ name }) => (
              <Th key={name}>{name}</Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.map((row) => {
            return (
              <Tr key={row.id}>
                {headers.map(({ dataKey }) => {
                  return <Td key={dataKey}>{row[dataKey]}</Td>;
                })}
              </Tr>
            );
          })}
        </Tbody>
        <Tfoot>
          <Tr>
            {headers.map(({ name }) => (
              <Th key={name}>{name}</Th>
            ))}
          </Tr>
        </Tfoot>
      </Table>
    </Box>
  );
}
