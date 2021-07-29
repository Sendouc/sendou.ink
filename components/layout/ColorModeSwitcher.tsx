import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

const ColorModeSwitcher = ({ isMobile }: { isMobile?: boolean }) => {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <IconButton
      data-cy="color-mode-toggle"
      aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
      variant="ghost"
      color="current"
      onClick={toggleColorMode}
      icon={colorMode === "light" ? <FiSun /> : <FiMoon />}
      _hover={
        colorMode === "dark"
          ? { bg: "white !important", color: "black" }
          : { bg: "black !important", color: "white" }
      }
      borderRadius={isMobile ? "50%" : "0"}
      size={isMobile ? "lg" : "sm"}
      height="50px"
      mx={2}
      display={isMobile ? "flex" : ["none", null, null, "flex"]}
    />
  );
};

export default ColorModeSwitcher;
