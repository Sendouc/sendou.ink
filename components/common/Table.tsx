// https://github.com/chakra-ui/chakra-ui/issues/135#issuecomment-644878591

import { Box, BoxProps } from "@chakra-ui/react";
import { useMyTheme } from "hooks/common";

/**
 * Represents tabular data - that is, information presented in a
 * two-dimensional table comprised of rows and columns of cells containing
 * data. It renders a `<table>` HTML element.
 */
export function Table(props: BoxProps) {
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
export function TableHead(props: BoxProps) {
  return <Box as="thead" {...props} />;
}

/**
 * Defines a row of cells in a table. The row's cells can then be established
 * using a mix of `TableCell` and `TableHeader` elements. It renders a `<tr>`
 * HTML element.
 */
export function TableRow(props: BoxProps) {
  const { secondaryBgColor } = useMyTheme();
  return (
    <Box
      as="tr"
      {...props}
      _even={{ backgroundColor: secondaryBgColor }}
      borderRadius="5px"
    />
  );
}

export function TableHeader(props: BoxProps) {
  const { themeColorHex: themeColor } = useMyTheme();

  return (
    <>
      <Box
        as="th"
        px="4"
        py="3"
        backgroundColor={themeColor}
        textAlign="left"
        fontSize="xs"
        textColor="black"
        textTransform="uppercase"
        letterSpacing="wider"
        lineHeight="1rem"
        fontWeight="medium"
        {...props}
      />
    </>
  );
}

/**
 * Encapsulates a set of table rows, indicating that they comprise the body of
 * the table. It renders a `<tbody>` HTML element.
 */
export function TableBody(props: BoxProps) {
  return <Box as="tbody" {...props} />;
}

/**
 * Defines a cell of a table that contains data. It renders a `<td>` HTML
 * element.
 */
export function TableCell(props: BoxProps) {
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
