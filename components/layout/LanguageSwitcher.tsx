import { IconButton, useColorMode } from "@chakra-ui/react";
import { FiGlobe } from "react-icons/fi";

const LanguageSwitcher = ({ isMobile }: { isMobile?: boolean }) => {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      data-cy="color-mode-toggle"
      aria-label={`Switch to ${colorMode === "light" ? "dark" : "light"} mode`}
      variant="ghost"
      color="current"
      onClick={toggleColorMode}
      icon={<FiGlobe />}
      _hover={
        colorMode === "dark"
          ? { bg: "white", color: "black" }
          : { bg: "black", color: "white" }
      }
      borderRadius={isMobile ? "50%" : "0"}
      size={isMobile ? "lg" : "sm"}
      display={isMobile ? "flex" : ["none", null, null, "flex"]}
    />
  );
};

export default LanguageSwitcher;
