/* eslint-disable */

import { Box } from "@chakra-ui/layout";
import BeautifulDrawingOfBorzoic from "components/layout/BeautifulDrawingByBorzoic";
import { useState } from "react";

const DemoPage = () => {
  const [colorIndex, setColorIndex] = useState(0);
  return (
    <>
      <Box>
        <BeautifulDrawingOfBorzoic
          type="boy"
          colorIndex={colorIndex}
          setColorIndex={setColorIndex}
        />
      </Box>
      <Box ml="24rem">
        <BeautifulDrawingOfBorzoic
          type="girl"
          colorIndex={colorIndex}
          setColorIndex={setColorIndex}
        />
      </Box>
    </>
  );
};

export default DemoPage;
