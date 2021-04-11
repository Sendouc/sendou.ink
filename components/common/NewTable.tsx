import { Box } from "@chakra-ui/layout";
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
import React from "react";

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
          {data.map((row, i) => {
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
