import React, { useState, useEffect, useContext } from "react";
import { Spinner, Box } from "@chakra-ui/core";
import MyThemeContext from "../../themeContext";

const Loading: React.FC = () => {
  const { themeColorWithShade } = useContext(MyThemeContext);
  const [showSpinner, setShowSpinner] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!showSpinner) return null;

  return (
    <Box textAlign="center" pt="2em">
      <Spinner
        color={themeColorWithShade}
        size="xl"
        thickness="4px"
        speed="0.65s"
      />
    </Box>
  );
};

export default Loading;
