/* eslint-disable */

import { Box } from "@chakra-ui/layout";
import BeautifulDrawingOfBorzoic from "components/layout/BeautifulDrawingByBorzoic";

const DemoPage = () => {
  return (
    <>
      <Box>
        <BeautifulDrawingOfBorzoic type="boy" />
      </Box>
      <Box ml="24rem">
        <BeautifulDrawingOfBorzoic type="girl" />
      </Box>
    </>
  );
};

export default DemoPage;
