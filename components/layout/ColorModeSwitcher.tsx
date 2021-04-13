import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiMoon, FiSun } from "react-icons/fi";

const ColorModeSwitcher = () => {
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
          ? { bg: "white", color: "black" }
          : { bg: "black", color: "white" }
      }
      borderRadius="0"
      size="sm"
      mx={2}
    />
  );
};

export default ColorModeSwitcher;
