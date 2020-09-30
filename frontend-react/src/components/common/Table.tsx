// https://github.com/chakra-ui/chakra-ui/issues/135#issuecomment-644878591

import { Box } from "@chakra-ui/core";
import React, { useContext } from "react";
import MyThemeContext from "../../themeContext";

/**
 * Represents tabular data - that is, information presented in a
 * two-dimensional table comprised of rows and columns of cells containing
 * data. It renders a `<table>` HTML element.
 */
export function Table(props: any) {
  return (
    <Box overflow="auto">
      <Box as="table" width="full" {...props} />
    </Box>
  );
}

/**
 * Defines a set of rows defining the head of the columns of the table. It
 * renders a `<thead>` HTML element.
 */
export function TableHead(props: any) {
  return <Box as="thead" {...props} />;
}

/**
 * Defines a row of cells in a table. The row's cells can then be established
 * using a mix of `TableCell` and `TableHeader` elements. It renders a `<tr>`
 * HTML element.
 */
export function TableRow(props: any) {
  const { darkerBgColor } = useContext(MyThemeContext);
  return (
    <Box
      as="tr"
      {...props}
      _even={{ backgroundColor: darkerBgColor }}
      borderRadius="5px"
    />
  );
}

/**
 * Defines a cell as header of a group of table cells. It renders a `<th>` HTML
 * element.
 */
export function TableHeader(props: any) {
  const { themeColorWithShade } = useContext(MyThemeContext);
  return (
    <Box
      as="th"
      px="4"
      py="3"
      backgroundColor={themeColorWithShade}
      textAlign="left"
      fontSize="xs"
      textColor="black"
      textTransform="uppercase"
      letterSpacing="wider"
      lineHeight="1rem"
      fontWeight="medium"
      {...props}
    />
  );
}

/**
 * Encapsulates a set of table rows, indicating that they comprise the body of
 * the table. It renders a `<tbody>` HTML element.
 */
export function TableBody(props: any) {
  return <Box as="tbody" {...props} />;
}

/**
 * Defines a cell of a table that contains data. It renders a `<td>` HTML
 * element.
 */
export function TableCell(props: any) {
  return (
    <Box
      as="td"
      px="4"
      py="4"
      lineHeight="1.25rem"
      whiteSpace="nowrap"
      {...props}
    />
  );
}
