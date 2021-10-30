import Document from "next/document";
import { createGetInitialProps } from "@mantine/next";

const getInitialProps = createGetInitialProps();

// TODO: https://stitches.dev/blog/using-nextjs-with-stitches
export default class _Document extends Document {
  static getInitialProps = getInitialProps;
}
